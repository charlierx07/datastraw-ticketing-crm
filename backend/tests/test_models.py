import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.ticket import Ticket, Note
from app.utils.ticket_id import generate_next_ticket_id


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_ticket_model_and_notes_relationship(test_db):
    # 1. Generate first ticket ID
    tid1 = generate_next_ticket_id(test_db)
    assert tid1 == "TKT-001"

    # 2. Insert ticket
    ticket = Ticket(
        ticket_id=tid1,
        customer_name="Rahul Sharma",
        customer_email="rahul@gmail.com",
        subject="Order has not arrived",
        description="My order was expected yesterday but I haven't received it.",
        status="Open",
    )
    test_db.add(ticket)
    test_db.commit()
    test_db.refresh(ticket)

    assert ticket.id == 1
    assert ticket.ticket_id == "TKT-001"
    assert ticket.status == "Open"
    assert ticket.created_at is not None
    assert ticket.updated_at is not None

    # 3. Next ticket ID generation
    tid2 = generate_next_ticket_id(test_db)
    assert tid2 == "TKT-002"

    # 4. Add notes to ticket
    note1 = Note(
        ticket_id=ticket.ticket_id,
        note_text="Contacted logistics team."
    )
    note2 = Note(
        ticket_id=ticket.ticket_id,
        note_text="Package delayed at Mumbai hub."
    )
    test_db.add_all([note1, note2])
    test_db.commit()
    test_db.refresh(ticket)

    # 5. Verify relationship
    assert len(ticket.notes) == 2
    assert ticket.notes[0].note_text in ["Contacted logistics team.", "Package delayed at Mumbai hub."]
