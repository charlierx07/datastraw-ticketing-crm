import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client_and_db():
    # Use in-memory SQLite with StaticPool so all connections share the same memory instance
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    yield client, TestingSessionLocal

    app.dependency_overrides.clear()


def test_ticket_crud_and_search_flow(client_and_db):
    client, _ = client_and_db

    # 1. Empty database returns empty list
    res = client.get("/api/tickets")
    assert res.status_code == 200
    assert res.json() == []

    # 2. Create ticket 1
    t1_payload = {
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul@gmail.com",
        "subject": "Order has not arrived",
        "description": "My order was expected yesterday but I haven't received it."
    }
    res1 = client.post("/api/tickets", json=t1_payload)
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["ticket_id"] == "TKT-001"
    assert "created_at" in data1

    # 3. Create ticket 2
    t2_payload = {
        "customer_name": "Priya Shah",
        "customer_email": "priya@company.org",
        "subject": "Refund pending for return",
        "description": "Returned the item 4 days ago. Need status on refund."
    }
    res2 = client.post("/api/tickets", json=t2_payload)
    assert res2.status_code == 201
    data2 = res2.json()
    assert data2["ticket_id"] == "TKT-002"

    # 4. List all tickets
    res_list = client.get("/api/tickets")
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) == 2
    # Order should be newest first
    assert items[0]["ticket_id"] == "TKT-002"
    assert items[1]["ticket_id"] == "TKT-001"

    # 5. Search by customer name
    res_search_name = client.get("/api/tickets?search=rahul")
    assert len(res_search_name.json()) == 1
    assert res_search_name.json()[0]["ticket_id"] == "TKT-001"

    # 6. Search by ticket ID
    res_search_id = client.get("/api/tickets?search=TKT-002")
    assert len(res_search_id.json()) == 1
    assert res_search_id.json()[0]["customer_name"] == "Priya Shah"

    # 7. Search by email
    res_search_email = client.get("/api/tickets?search=company.org")
    assert len(res_search_email.json()) == 1
    assert res_search_email.json()[0]["ticket_id"] == "TKT-002"

    # 8. Search by description keyword
    res_search_desc = client.get("/api/tickets?search=yesterday")
    assert len(res_search_desc.json()) == 1
    assert res_search_desc.json()[0]["ticket_id"] == "TKT-001"

    # 9. Update ticket 1 status and add note
    update_res = client.put(
        "/api/tickets/TKT-001",
        json={"status": "In Progress", "notes": "Contacted logistics hub in Mumbai."}
    )
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

    # 10. Add second note without status change
    note_res = client.put(
        "/api/tickets/TKT-001",
        json={"notes": "Customer notified via SMS."}
    )
    assert note_res.status_code == 200

    # 11. Retrieve ticket detail and verify notes
    detail_res = client.get("/api/tickets/TKT-001")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["ticket_id"] == "TKT-001"
    assert detail["status"] == "In Progress"
    assert len(detail["notes"]) == 2
    note_texts = [n["note_text"] for n in detail["notes"]]
    assert "Contacted logistics hub in Mumbai." in note_texts
    assert "Customer notified via SMS." in note_texts

    # 12. Filter by status
    res_filter_inprogress = client.get("/api/tickets?status=In Progress")
    assert len(res_filter_inprogress.json()) == 1
    assert res_filter_inprogress.json()[0]["ticket_id"] == "TKT-001"

    res_filter_open = client.get("/api/tickets?status=Open")
    assert len(res_filter_open.json()) == 1
    assert res_filter_open.json()[0]["ticket_id"] == "TKT-002"

    # 13. Combined search and status
    res_comb = client.get("/api/tickets?status=In Progress&search=rahul")
    assert len(res_comb.json()) == 1
    res_comb_no_match = client.get("/api/tickets?status=Closed&search=rahul")
    assert len(res_comb_no_match.json()) == 0


def test_api_validations_and_404(client_and_db):
    client, _ = client_and_db

    # 1. Invalid email
    bad_email = client.post(
        "/api/tickets",
        json={
            "customer_name": "Test User",
            "customer_email": "not-an-email",
            "subject": "Issue",
            "description": "Description"
        }
    )
    assert bad_email.status_code == 422

    # 2. Empty string validation
    empty_name = client.post(
        "/api/tickets",
        json={
            "customer_name": "   ",
            "customer_email": "test@domain.com",
            "subject": "Issue",
            "description": "Description"
        }
    )
    assert empty_name.status_code == 422

    # 3. Missing ticket 404
    missing_ticket = client.get("/api/tickets/TKT-999")
    assert missing_ticket.status_code == 404
    assert "not found" in missing_ticket.json()["detail"].lower()

    # 4. Invalid status update
    invalid_status = client.put(
        "/api/tickets/TKT-001",
        json={"status": "ArbitraryStatus"}
    )
    assert invalid_status.status_code == 422


def test_ai_insights_feature(client_and_db):
    client, _ = client_and_db

    # Create ticket with logistics issue
    payload = {
        "customer_name": "Vikram Mehta",
        "customer_email": "vikram@outlook.com",
        "subject": "Delayed delivery of laptop",
        "description": "I have been waiting for 5 days, package is stuck in transit and I am very frustrated!"
    }
    res = client.post("/api/tickets", json=payload)
    assert res.status_code == 201
    tid = res.json()["ticket_id"]

    # Verify detail has AI insights
    detail_res = client.get(f"/api/tickets/{tid}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["ai_category"] in ["Shipping & Logistics", "General Inquiry"]
    assert data["ai_priority"] in ["High", "Medium"]
    assert data["ai_sentiment"] == "Negative"
    assert "Hi Vikram" in data["ai_suggested_response"]

    # Test refresh endpoint
    refresh_res = client.post(f"/api/tickets/{tid}/ai-insights")
    assert refresh_res.status_code == 200
    assert refresh_res.json()["ticket_id"] == tid
