import httpx

BASE_URL = "http://127.0.0.1:8000"

def test_flow():
    # 1. Health check
    res = httpx.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] Health check ok")

    # 2. Create ticket
    payload = {
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul@gmail.com",
        "subject": "Order has not arrived",
        "description": "My order was expected yesterday but I have not received it."
    }
    create_res = httpx.post(f"{BASE_URL}/api/tickets", json=payload)
    assert create_res.status_code == 201, f"Create failed: {create_res.text}"
    ticket_id = create_res.json()["ticket_id"]
    print(f"[OK] Created ticket: {ticket_id}")

    # 3. Create second ticket
    payload2 = {
        "customer_name": "Priya Shah",
        "customer_email": "priya@gmail.com",
        "subject": "Refund inquiry",
        "description": "I need a refund for my canceled item."
    }
    create_res2 = httpx.post(f"{BASE_URL}/api/tickets", json=payload2)
    assert create_res2.status_code == 201
    ticket_id2 = create_res2.json()["ticket_id"]
    print(f"[OK] Created second ticket: {ticket_id2}")

    # 4. List all tickets
    list_res = httpx.get(f"{BASE_URL}/api/tickets")
    assert list_res.status_code == 200
    tickets = list_res.json()
    assert len(tickets) >= 2
    print(f"[OK] Listed {len(tickets)} tickets")

    # 5. Search by name
    search_res = httpx.get(f"{BASE_URL}/api/tickets", params={"search": "Rahul"})
    assert any(t["ticket_id"] == ticket_id for t in search_res.json())
    print("[OK] Search by name works")

    # 6. Search by ticket_id
    search_id_res = httpx.get(f"{BASE_URL}/api/tickets", params={"search": ticket_id})
    assert len(search_id_res.json()) == 1
    print("[OK] Search by ticket ID works")

    # 7. Update status & add note
    update_payload = {
        "status": "In Progress",
        "notes": "Contacted Mumbai logistics hub. Out for delivery."
    }
    update_res = httpx.put(f"{BASE_URL}/api/tickets/{ticket_id}", json=update_payload)
    assert update_res.status_code == 200
    print("[OK] Status updated to In Progress and note added")

    # 8. Add second note
    note_payload = {
        "notes": "Spoke with customer over phone, customer confirmed delivery address."
    }
    note_res = httpx.put(f"{BASE_URL}/api/tickets/{ticket_id}", json=note_payload)
    assert note_res.status_code == 200
    print("[OK] Second note added successfully")

    # 9. Detail verification
    detail_res = httpx.get(f"{BASE_URL}/api/tickets/{ticket_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["status"] == "In Progress"
    assert len(detail["notes"]) == 2
    print(f"[OK] Detail verified with {len(detail['notes'])} notes and AI category '{detail.get('ai_category')}'")

    # 10. Filter by status
    filter_res = httpx.get(f"{BASE_URL}/api/tickets", params={"status": "In Progress"})
    assert any(t["ticket_id"] == ticket_id for t in filter_res.json())
    print("[OK] Status filter works")

    print("\nALL 10 END-TO-END VERIFICATION CHECKS PASSED!")

if __name__ == "__main__":
    test_flow()
