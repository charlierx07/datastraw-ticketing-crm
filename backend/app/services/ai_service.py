import logging
from typing import Dict, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    @staticmethod
    def analyze_ticket(
        customer_name: str,
        subject: str,
        description: str
    ) -> Dict[str, Optional[str]]:
        """
        Analyzes ticket content to extract Category, Priority, Sentiment,
        and generate a Suggested Response.
        
        CRITICAL ARCHITECTURAL GUARANTEE:
        This function is wrapped with total fault tolerance.
        If an external API is down, rate-limited, or misconfigured, it gracefully
        returns sensible defaults without ever throwing an exception or blocking CRM CRUD.
        """
        try:
            # 1. Check if external AI provider is configured with Gemini API key
            if settings.gemini_api_key and settings.AI_PROVIDER.lower() in ["gemini", "openai"]:
                return AIService._call_external_ai(customer_name, subject, description)

            # 2. Deterministic fallback heuristics
            res = AIService._heuristic_analysis(customer_name, subject, description)
            res["ai_source"] = "fallback"
            return res

        except Exception as e:
            logger.warning(f"AI ticket analysis failed gracefully: {e}")
            res = AIService._heuristic_analysis(customer_name, subject, description)
            res["ai_source"] = "fallback"
            return res

    @staticmethod
    def _heuristic_analysis(
        customer_name: str,
        subject: str,
        description: str
    ) -> Dict[str, str]:
        text = f"{subject} {description}".lower()

        # Category detection
        if any(w in text for w in ["refund", "return", "charge", "charged", "billing", "payment", "invoice"]):
            category = "Billing & Refund"
        elif any(w in text for w in ["deliver", "delivery", "shipping", "shipped", "package", "arrived", "track"]):
            category = "Shipping & Logistics"
        elif any(w in text for w in ["bug", "error", "crash", "broken", "login", "password", "website"]):
            category = "Technical Support"
        elif any(w in text for w in ["damaged", "wrong", "defective", "quality", "size", "color"]):
            category = "Product Issue"
        else:
            category = "General Inquiry"

        # Sentiment detection
        negative_words = ["angry", "upset", "worst", "terrible", "horrible", "delay", "delayed", "urgent", "frustrated", "bad", "not received"]
        positive_words = ["thank", "thanks", "appreciate", "great", "helpful", "good"]

        neg_count = sum(1 for w in negative_words if w in text)
        pos_count = sum(1 for w in positive_words if w in text)

        if neg_count > pos_count:
            sentiment = "Negative"
        elif pos_count > neg_count:
            sentiment = "Positive"
        else:
            sentiment = "Neutral"

        # Priority detection
        if any(w in text for w in ["urgent", "immediately", "asap", "emergency", "fraud", "unauthorized"]):
            priority = "High"
        elif category in ["Billing & Refund", "Shipping & Logistics"] and sentiment == "Negative":
            priority = "High"
        elif any(w in text for w in ["delayed", "waiting", "status", "wrong item"]):
            priority = "Medium"
        else:
            priority = "Low"

        # Suggested response draft
        first_name = customer_name.split()[0] if customer_name else "Valued Customer"
        if category == "Shipping & Logistics":
            suggested_response = (
                f"Hi {first_name}, thank you for reaching out. We apologize for the shipping delay with your order. "
                "Our logistics team has been notified and is currently tracking the latest transit scan. We will update you with exact delivery timing within 24 hours."
            )
        elif category == "Billing & Refund":
            suggested_response = (
                f"Hi {first_name}, thank you for reaching out. I'm sorry for the duplicate charge. "
                "Our billing team will review the transaction and assist with the refund process."
            )
        elif category == "Technical Support":
            suggested_response = (
                f"Hi {first_name}, thank you for reporting this issue. Our engineering team is investigating the behavior you described. "
                "Could you please confirm your browser/device version so we can diagnose this more quickly?"
            )
        else:
            suggested_response = (
                f"Hi {first_name}, thank you for contacting our support team. We have received your inquiry regarding '{subject}' "
                "and an agent is reviewing the details. We'll follow up shortly."
            )

        return {
            "category": category,
            "priority": priority,
            "sentiment": sentiment,
            "suggested_response": suggested_response,
            "ai_source": "fallback"
        }

    @staticmethod
    def _call_external_ai(customer_name: str, subject: str, description: str) -> Dict[str, str]:
        if settings.AI_PROVIDER.lower() == "gemini":
            return AIService._call_gemini_ai(customer_name, subject, description)
        res = AIService._heuristic_analysis(customer_name, subject, description)
        res["ai_source"] = "fallback"
        return res

    @staticmethod
    def _call_gemini_ai(customer_name: str, subject: str, description: str) -> Dict[str, str]:
        """
        Calls Google Gemini API via HTTP REST using httpx with robust formatting and parsing.
        Uses structured JSON response format.
        Falls back to heuristics with clear 'fallback' label if timeout, quota error, or invalid key occurs.
        """
        import httpx
        import json
        import re

        api_key = settings.gemini_api_key
        prompt = (
            "You are an AI customer support assistant for a SaaS CRM.\n"
            "Analyze the following customer support ticket and return a strict, valid JSON object.\n\n"
            f"Customer Name: {customer_name}\n"
            f"Subject: {subject}\n"
            f"Description: {description}\n\n"
            "Formatting & Content Rules for 'suggested_response':\n"
            "1. Plain Text Spacing: Output natural, readable English. Always preserve normal spaces between all words, numbers, dates, punctuation, and currency amounts. Never merge or run numbers and words together (e.g. write '$120 on September 12th', NEVER '120onSeptember12th').\n"
            "2. Honest Scope: Do NOT invent or claim actions that have not been performed yet. Do NOT say 'I have initiated a refund' or 'I have cancelled the charge' unless the customer's text confirms that has already occurred.\n"
            "3. Expected Tone for billing/charge disputes: Acknowledge the problem with empathy, and say something like:\n"
            "   'I’m sorry for the duplicate charge. Our billing team will review the transaction and assist with the refund process.'\n"
            "4. Address the customer respectfully by their name.\n\n"
            "Required JSON fields:\n"
            "- 'category': One of 'Billing & Refund', 'Shipping & Logistics', 'Technical Support', 'Product Issue', 'General Inquiry'\n"
            "- 'priority': One of 'High', 'Medium', 'Low'\n"
            "- 'sentiment': One of 'Negative', 'Neutral', 'Positive'\n"
            "- 'suggested_response': Properly formatted, professional first reply string."
        )

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        # Candidate models list: attempts gemini-3.5-flash first, then gemini-flash-latest, then gemini-3.6-flash
        candidate_models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.6-flash"]

        for model in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                resp = httpx.post(url, json=payload, timeout=12.0)
                if resp.status_code == 200:
                    data = resp.json()
                    text_response = data["candidates"][0]["content"]["parts"][0]["text"].strip()

                    # Robust cleaning if wrapped in markdown code fence
                    if text_response.startswith("```"):
                        text_response = re.sub(r"^```(?:json)?\s*", "", text_response)
                        text_response = re.sub(r"\s*```$", "", text_response)

                    parsed = json.loads(text_response)

                    valid_categories = ["Billing & Refund", "Shipping & Logistics", "Technical Support", "Product Issue", "General Inquiry"]
                    valid_priorities = ["High", "Medium", "Low"]
                    valid_sentiments = ["Negative", "Neutral", "Positive"]

                    category = parsed.get("category") if parsed.get("category") in valid_categories else "General Inquiry"
                    priority = parsed.get("priority") if parsed.get("priority") in valid_priorities else "Medium"
                    sentiment = parsed.get("sentiment") if parsed.get("sentiment") in valid_sentiments else "Neutral"
                    suggested_response = str(parsed.get("suggested_response", "")).strip()

                    # Clean any accidental math formatting delimiters while preserving symbols and numbers
                    suggested_response = suggested_response.replace(r"\$", "$")

                    if not suggested_response:
                        suggested_response = f"Hi {customer_name}, thank you for contacting support. Our team is reviewing your inquiry regarding '{subject}' and will assist you shortly."

                    return {
                        "category": category,
                        "priority": priority,
                        "sentiment": sentiment,
                        "suggested_response": suggested_response,
                        "ai_source": "gemini"
                    }
                else:
                    logger.warning(f"Model {model} returned status {resp.status_code}: {resp.text[:150]}")
                    # If 429 quota or 503 unavailable, try next candidate model
                    if resp.status_code in [429, 503]:
                        continue
            except Exception as e:
                logger.warning(f"Gemini call to {model} failed: {e}")
                continue

        fallback = AIService._heuristic_analysis(customer_name, subject, description)
        fallback["ai_source"] = "fallback"
        return fallback
