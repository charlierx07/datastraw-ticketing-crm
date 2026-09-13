import httpx
import json

print("=== TESTING AI TICKET ANALYSIS RESPONSE FORMATTING ===\n")

# Create ticket with: dollar amount ($120), date (September 12th), duplicate billing issue, customer name (Meera Sundaram)
payload = {
    "customer_name": "Meera Sundaram",
    "customer_email": "meera.sundaram@example.com",
    "subject": "Charged twice on credit card for annual plan",
    "description": "I noticed two separate charges of $120 on my credit card statement on September 12th for my annual subscription. Please cancel the duplicate charge and issue a full refund for one of them."
}

resp_create = httpx.post("http://127.0.0.1:8000/api/tickets", json=payload, timeout=25.0)
assert resp_create.status_code == 201, f"Failed creation: {resp_create.text}"
ticket = resp_create.json()
t_id = ticket["ticket_id"]
print(f"1. Created Ticket: {t_id}")
print(f"   Customer: {ticket['customer_name']}")
print(f"   Subject: {ticket['subject']}")

# Trigger live AI analysis endpoint: POST /api/tickets/{ticket_id}/ai-insights
print(f"\n2. Calling live endpoint: POST /api/tickets/{t_id}/ai-insights ...")
resp_ai = httpx.post(f"http://127.0.0.1:8000/api/tickets/{t_id}/ai-insights", timeout=25.0)
assert resp_ai.status_code == 200, f"Failed AI analysis: {resp_ai.text}"
data = resp_ai.json()

print(f"\n3. Live Response Data:")
print(f"   Status Code: {resp_ai.status_code}")
print(f"   Category: {data.get('ai_category')}")
print(f"   Priority: {data.get('ai_priority')}")
print(f"   Sentiment: {data.get('ai_sentiment')}")
print(f"   AI Source: {data.get('ai_source')}")
print(f"   Suggested Response:\n   \"{data.get('ai_suggested_response')}\"\n")

suggested = data.get("ai_suggested_response", "")

# Verification checks:
# Requirement 4 & 5: Check proper spacing around $120 and dates, no words running together
assert "120onSeptember12th" not in suggested, "FAILED: Found corrupted merged text '120onSeptember12th'"
assert "Ihaveinitiatedafullrefundof" not in suggested, "FAILED: Found corrupted merged text 'Ihaveinitiatedafullrefundof'"

# Requirement 6: Do not allow Gemini to invent actions like "I have initiated a refund"
assert "I have initiated" not in suggested, "FAILED: Invented action 'I have initiated' found in response"
assert "I have refunded" not in suggested, "FAILED: Invented action 'I have refunded' found in response"
assert "I have cancelled" not in suggested, "FAILED: Invented action 'I have cancelled' found in response"

# Requirement 7: The suggested response should say something like:
# "I’m sorry for the duplicate charge. Our billing team will review the transaction and assist with the refund process."
assert any(phrase in suggested.lower() for phrase in ["sorry for the duplicate charge", "apologize for the duplicate", "billing team"]), "FAILED: Expected empathy and review statement not found"

print("-> ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
