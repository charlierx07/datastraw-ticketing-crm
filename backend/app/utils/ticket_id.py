import re
from sqlalchemy.orm import Session
from app.models.ticket import Ticket


def generate_next_ticket_id(db: Session) -> str:
    """
    Generates a unique, human-readable ticket identifier in the format TKT-001, TKT-002, etc.
    Finds the latest ticket by primary key id, extracts the counter, and increments by 1.
    """
    latest_ticket = db.query(Ticket).order_by(Ticket.id.desc()).first()
    if not latest_ticket or not latest_ticket.ticket_id:
        return "TKT-001"

    # Match numeric suffix from TKT-(\d+)
    match = re.search(r"TKT-(\d+)", latest_ticket.ticket_id)
    if match:
        next_num = int(match.group(1)) + 1
    else:
        next_num = latest_ticket.id + 1

    candidate_id = f"TKT-{next_num:03d}"

    # Verify uniqueness in case of manual insert or concurrent transaction
    while db.query(Ticket).filter(Ticket.ticket_id == candidate_id).first():
        next_num += 1
        candidate_id = f"TKT-{next_num:03d}"

    return candidate_id
