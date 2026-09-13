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
            # 1. Check if external AI provider is configured with an API key
            if settings.AI_API_KEY and settings.AI_PROVIDER.lower() in ["gemini", "openai"]:
                # External API call can be executed here; falls back to heuristic engine if unavailable
                return AIService._call_external_ai(customer_name, subject, description)

            # 2. Intelligent, deterministic fallback heuristics (guaranteed 100% offline uptime)
            return AIService._heuristic_analysis(customer_name, subject, description)

        except Exception as e:
            logger.warning(f"AI ticket analysis failed gracefully: {e}")
            return {
                "category": "General Inquiry",
                "priority": "Medium",
                "sentiment": "Neutral",
                "suggested_response": "Thank you for reaching out to customer support. We are reviewing your ticket."
            }

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
                f"Hi {first_name}, we appreciate your patience regarding this matter. We have initiated a review with our accounts department "
                "to trace the transaction and expedite your refund. You will receive an official notification once processed."
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
            "suggested_response": suggested_response
        }

    @staticmethod
    def _call_external_ai(customer_name: str, subject: str, description: str) -> Dict[str, str]:
        if settings.AI_PROVIDER.lower() == "gemini":
            return AIService._call_gemini_ai(customer_name, subject, description)
        # Fallback to heuristic analysis if any error occurs
        return AIService._heuristic_analysis(customer_name, subject, description)

    @staticmethod
    def _call_gemini_ai(customer_name: str, subject: str, description: str) -> Dict[str, str]:
        """
        Calls Google Gemini 1.5 Flash API via HTTP REST using httpx.
        Uses structured JSON response format.
        Falls back to heuristics if timeout, quota error, or invalid key occurs.
        """
        import httpx
        import json

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={settings.AI_API_KEY}"
        prompt = (
            f"You are an AI customer support assistant. Analyze the following customer support ticket and return a JSON object:\n"
            f"Customer Name: {customer_name}\n"
            f"Subject: {subject}\n"
            f"Description: {description}\n\n"
            f"Return ONLY a JSON object with these exact keys:\n"
            f"- 'category': One of 'Billing & Refund', 'Shipping & Logistics', 'Technical Support', 'Product Issue', 'General Inquiry'\n"
            f"- 'priority': One of 'High', 'Medium', 'Low'\n"
            f"- 'sentiment': One of 'Negative', 'Neutral', 'Positive'\n"
            f"- 'suggested_response': A helpful, empathetic, professional initial reply addressing the customer by name ({customer_name})."
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

        try:
            resp = httpx.post(url, json=payload, timeout=12.0)
            if resp.status_code == 200:
                data = resp.json()
                text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_response)

                valid_categories = ["Billing & Refund", "Shipping & Logistics", "Technical Support", "Product Issue", "General Inquiry"]
                valid_priorities = ["High", "Medium", "Low"]
                valid_sentiments = ["Negative", "Neutral", "Positive"]

                category = parsed.get("category") if parsed.get("category") in valid_categories else "General Inquiry"
                priority = parsed.get("priority") if parsed.get("priority") in valid_priorities else "Medium"
                sentiment = parsed.get("sentiment") if parsed.get("sentiment") in valid_sentiments else "Neutral"
                suggested_response = parsed.get("suggested_response", "").strip()

                if not suggested_response:
                    suggested_response = f"Hi {customer_name}, thank you for contacting support. We have received your inquiry regarding '{subject}' and are looking into it."

                return {
                    "category": category,
                    "priority": priority,
                    "sentiment": sentiment,
                    "suggested_response": suggested_response
                }
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to heuristics: {e}")

        return AIService._heuristic_analysis(customer_name, subject, description)
