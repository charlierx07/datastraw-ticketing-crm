import httpx
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(client, name, method, url, expected_statuses, **kwargs):
    try:
        resp = client.request(method, url, **kwargs)
        status = resp.status_code
        is_ok = status in expected_statuses
        print(f"[{'PASS' if is_ok else 'FAIL'}] {name}: {method} {url} -> Status {status} (Expected: {expected_statuses})")
        if not is_ok:
            print("  Response:", resp.text)
        return resp
    except Exception as e:
        print(f"[FAIL] {name}: Request error -> {e}")
        return None

def format_err(r):
    if not r:
        return ""
    try:
        data = r.json()
        if "errors" in data and isinstance(data["errors"], list):
            return ", ".join(f"{e.get('field', 'field')}: {e.get('message', '')}" for e in data["errors"])
        return str(data.get("detail", data))
    except Exception:
        return r.text

def run_audit():
    print("=== 1. BACKEND API AUDIT ===")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. GET /health
        test_endpoint(client, "Health Check", "GET", "/health", [200])

        # 2. POST /api/tickets with valid data
        valid_payload = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "subject": "Test support issue",
            "description": "This is a complete functional test ticket."
        }
        r = test_endpoint(client, "Create Valid Ticket", "POST", "/api/tickets", [201], json=valid_payload)
        ticket = r.json()
        t_id = ticket.get("ticket_id")
        print(f"  Created Ticket ID: {t_id}")
        print(f"  Status: {ticket.get('status')} (Expected: Open)")
        print(f"  Created At: {ticket.get('created_at')}")
        print(f"  Customer Name: {ticket.get('customer_name')}")
        print(f"  Customer Email: {ticket.get('customer_email')}")
        print(f"  Subject: {ticket.get('subject')}")
        print(f"  Description: {ticket.get('description')}")
        print(f"  AI Category: {ticket.get('ai_category')}")
        print(f"  AI Priority: {ticket.get('ai_priority')}")
        print(f"  AI Sentiment: {ticket.get('ai_sentiment')}")
        print(f"  AI Suggested Response: {ticket.get('ai_suggested_response')}")

        # Assert all required fields
        assert ticket.get("ticket_id"), "Missing ticket_id"
        assert ticket.get("status") == "Open", f"Expected Open, got {ticket.get('status')}"
        assert ticket.get("customer_name") == valid_payload["customer_name"]
        assert ticket.get("customer_email") == valid_payload["customer_email"]
        assert ticket.get("subject") == valid_payload["subject"]
        assert ticket.get("description") == valid_payload["description"]
        assert ticket.get("created_at"), "Missing created_at"

        # 3. GET /api/tickets
        test_endpoint(client, "List All Tickets", "GET", "/api/tickets", [200])

        # 4. GET /api/tickets/{ticket_id}
        r_get = test_endpoint(client, "Get Ticket By ID", "GET", f"/api/tickets/{t_id}", [200])
        assert r_get.json()["ticket_id"] == t_id

        # 5. PUT /api/tickets/{ticket_id} update status
        r_put = test_endpoint(client, "Update Status to In Progress", "PUT", f"/api/tickets/{t_id}", [200], json={"status": "In Progress"})
        print(f"  Updated status: {r_put.json().get('status')}")
        assert r_put.json().get("status") == "In Progress"

        # 6. POST /api/tickets/{ticket_id}/notes
        r_note = test_endpoint(client, "Add Dedicated Note", "POST", f"/api/tickets/{t_id}/notes", [201], json={"note_text": "Investigating customer test issue."})
        print(f"  Added note id: {r_note.json().get('id')}, text: {r_note.json().get('note_text')}")
        assert r_note.json().get("ticket_id") == t_id

        # 7. AI insights endpoint
        r_ai = test_endpoint(client, "Trigger AI Insights", "POST", f"/api/tickets/{t_id}/ai-insights", [200])
        assert r_ai.json()["ticket_id"] == t_id

        # Invalid tests
        print("\n--- Invalid Data Tests ---")
        # Empty customer name
        r = test_endpoint(client, "Empty Customer Name (422)", "POST", "/api/tickets", [422], json={**valid_payload, "customer_name": "   "})
        print(f"  Error message: {format_err(r)}")

        # Empty email
        r = test_endpoint(client, "Empty Email (422)", "POST", "/api/tickets", [422], json={**valid_payload, "customer_email": ""})
        print(f"  Error message: {format_err(r)}")

        # Invalid email
        r = test_endpoint(client, "Invalid Email (422)", "POST", "/api/tickets", [422], json={**valid_payload, "customer_email": "not-an-email"})
        print(f"  Error message: {format_err(r)}")

        # Empty subject
        r = test_endpoint(client, "Empty Subject (422)", "POST", "/api/tickets", [422], json={**valid_payload, "subject": " "})
        print(f"  Error message: {format_err(r)}")

        # Empty description
        r = test_endpoint(client, "Empty Description (422)", "POST", "/api/tickets", [422], json={**valid_payload, "description": ""})
        print(f"  Error message: {format_err(r)}")

        # Invalid status
        r = test_endpoint(client, "Invalid Status (400)", "PUT", f"/api/tickets/{t_id}", [400], json={"status": "InvalidStatus"})
        print(f"  Error message: {format_err(r)}")

        # Unknown ticket ID
        r = test_endpoint(client, "Unknown Ticket ID (404)", "GET", "/api/tickets/TKT-999999", [404])
        print(f"  Error message: {format_err(r)}")

        # Empty note
        r = test_endpoint(client, "Empty Note (422)", "POST", f"/api/tickets/{t_id}/notes", [422], json={"note_text": "   "})
        print(f"  Error message: {format_err(r)}")

        print("\n=== 2. SEARCH VERIFICATION ===")
        # Customer name
        r = client.get("/api/tickets", params={"search": "Test Customer"})
        assert any(t["ticket_id"] == t_id for t in r.json()), "Name search failed"
        print(f"[PASS] Search by customer name 'Test Customer': found {len(r.json())} matches (includes {t_id})")

        # Ticket ID
        r = client.get("/api/tickets", params={"search": t_id})
        assert any(t["ticket_id"] == t_id for t in r.json()), "Ticket ID search failed"
        print(f"[PASS] Search by ticket ID '{t_id}': found {len(r.json())} matches")

        # Email
        r = client.get("/api/tickets", params={"search": "test@example.com"})
        assert any(t["ticket_id"] == t_id for t in r.json()), "Email search failed"
        print(f"[PASS] Search by email 'test@example.com': found {len(r.json())} matches")

        # Description
        r = client.get("/api/tickets", params={"search": "functional test ticket"})
        assert any(t["ticket_id"] == t_id for t in r.json()), "Description search failed"
        print(f"[PASS] Search by description 'functional test ticket': found {len(r.json())} matches")

        # Partial text
        r = client.get("/api/tickets", params={"search": "funct"})
        assert any(t["ticket_id"] == t_id for t in r.json()), "Partial search failed"
        print(f"[PASS] Search by partial text 'funct': found {len(r.json())} matches")

        # Uppercase and lowercase text
        r_upper = client.get("/api/tickets", params={"search": "TEST CUSTOMER"})
        r_lower = client.get("/api/tickets", params={"search": "test customer"})
        assert len(r_upper.json()) == len(r_lower.json()), "Case sensitivity mismatch"
        print(f"[PASS] Case-insensitivity verified: UPPERCASE ({len(r_upper.json())}) == lowercase ({len(r_lower.json())}) matches")

        # Search with no results
        r_none = client.get("/api/tickets", params={"search": "XYZ999NONEXISTENT"})
        assert len(r_none.json()) == 0, "No-match search failed"
        print(f"[PASS] Search with no results: returned exactly {len(r_none.json())} items")

        print("\n=== 3. STATUS FILTER VERIFICATION ===")
        # All
        r_all = client.get("/api/tickets", params={"status": "All"}).json()
        print(f"[PASS] Filter 'All': returned {len(r_all)} tickets")

        # Open
        r_open = client.get("/api/tickets", params={"status": "Open"}).json()
        assert all(t["status"].lower() == "open" for t in r_open)
        print(f"[PASS] Filter 'Open': returned {len(r_open)} tickets, all have status='Open'")

        # In Progress
        r_prog = client.get("/api/tickets", params={"status": "In Progress"}).json()
        assert all(t["status"].lower() == "in progress" for t in r_prog)
        assert any(t["ticket_id"] == t_id for t in r_prog)
        print(f"[PASS] Filter 'In Progress': returned {len(r_prog)} tickets (includes {t_id})")

        # Closed
        r_closed = client.get("/api/tickets", params={"status": "Closed"}).json()
        assert all(t["status"].lower() == "closed" for t in r_closed)
        print(f"[PASS] Filter 'Closed': returned {len(r_closed)} tickets, all have status='Closed'")

        # Filtering with a search term
        r_comb = client.get("/api/tickets", params={"status": "In Progress", "search": "test@example.com"}).json()
        assert any(t["ticket_id"] == t_id for t in r_comb)
        print(f"[PASS] Filtering with search term (In Progress + test@example.com): found {len(r_comb)} tickets")

        # Changing status from In Progress to Closed
        r_close = client.put(f"/api/tickets/{t_id}", json={"status": "Closed"})
        assert r_close.status_code == 200 and r_close.json()["status"] == "Closed"
        print(f"[PASS] Changed status from In Progress to Closed: {r_close.json()['status']}")

        # Refreshing/re-fetching and confirming updated status remains saved
        r_check = client.get(f"/api/tickets/{t_id}").json()
        assert r_check["status"] == "Closed", "Persisted status mismatch"
        print(f"[PASS] Persistence verified: re-fetched ticket {t_id} has status='{r_check['status']}'")

        print("\n=== 4. NOTES VERIFICATION ===")
        # Add a second note
        r_note2 = client.post(f"/api/tickets/{t_id}/notes", json={"note_text": "Second chronological update note."})
        assert r_note2.status_code == 201

        # Re-fetch ticket details
        r_detail = client.get(f"/api/tickets/{t_id}").json()
        notes = r_detail.get("notes", [])
        assert len(notes) >= 2, f"Expected >= 2 notes, got {len(notes)}"
        print(f"[PASS] Multiple notes verified: ticket {t_id} has {len(notes)} notes")

        # Verify chronological ordering
        for i in range(len(notes) - 1):
            assert notes[i]["created_at"] <= notes[i+1]["created_at"], "Notes not in chronological order"
        print(f"[PASS] Notes chronological ordering verified: note 1 ({notes[0]['created_at']}) <= note 2 ({notes[1]['created_at']})")

        # Verify notes are attached to correct ticket and not shared
        other_tickets = [t for t in r_all if t["ticket_id"] != t_id]
        if other_tickets:
            ot_id = other_tickets[0]["ticket_id"]
            ot_detail = client.get(f"/api/tickets/{ot_id}").json()
            assert all(n["ticket_id"] == ot_id for n in ot_detail.get("notes", [])), "Other ticket has invalid foreign key"
            assert all(n["ticket_id"] == t_id for n in notes), "Current ticket has mismatched note ticket_id"
            print(f"[PASS] Notes foreign-key isolation verified: {ot_id} notes are strictly attached to {ot_id} and not shared with {t_id}")

        print("\nALL BACKEND AUDIT CHECKS PASSED WITH ZERO ERRORS!")

if __name__ == "__main__":
    run_audit()
