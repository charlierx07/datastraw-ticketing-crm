from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.ticket import Ticket, Note
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.utils.ticket_id import generate_next_ticket_id


class TicketService:
    @staticmethod
    def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
        """
        Creates a new ticket with an auto-generated unique ticket ID (TKT-001...),
        default 'Open' status, and current UTC timestamps.
        """
        ticket_id = generate_next_ticket_id(db)
        now = datetime.now(timezone.utc)

        # Isolated AI intelligence (guaranteed non-blocking)
        ai_data = {}
        try:
            from app.services.ai_service import AIService
            ai_data = AIService.analyze_ticket(
                customer_name=ticket_in.customer_name,
                subject=ticket_in.subject,
                description=ticket_in.description
            )
        except Exception:
            ai_data = {}

        db_ticket = Ticket(
            ticket_id=ticket_id,
            customer_name=ticket_in.customer_name,
            customer_email=ticket_in.customer_email,
            subject=ticket_in.subject,
            description=ticket_in.description,
            status="Open",
            created_at=now,
            updated_at=now,
            ai_category=ai_data.get("category"),
            ai_priority=ai_data.get("priority"),
            ai_sentiment=ai_data.get("sentiment"),
            ai_suggested_response=ai_data.get("suggested_response")
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        return db_ticket

    @staticmethod
    def get_tickets(
        db: Session,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Ticket]:
        """
        Retrieves tickets filtered by status and/or search term.
        Search is case-insensitive across customer_name, ticket_id, customer_email, and description.
        """
        query = db.query(Ticket)

        # Status filtering
        if status and status.strip() and status.strip().lower() != "all":
            clean_status = status.strip()
            # Match status case-insensitively
            query = query.filter(func.lower(Ticket.status) == clean_status.lower())

        # Search term across 4 fields
        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Ticket.customer_name).like(term),
                    func.lower(Ticket.ticket_id).like(term),
                    func.lower(Ticket.customer_email).like(term),
                    func.lower(Ticket.description).like(term),
                )
            )

        return query.order_by(Ticket.created_at.desc()).all()

    @staticmethod
    def get_ticket_by_id(db: Session, ticket_id: str) -> Optional[Ticket]:
        """Retrieves a single ticket by its human-readable ticket_id."""
        return db.query(Ticket).filter(Ticket.ticket_id == ticket_id.strip()).first()

    @staticmethod
    def update_ticket(
        db: Session,
        ticket_id: str,
        update_data: TicketUpdate
    ) -> Optional[Ticket]:
        """
        Updates ticket status and/or appends a new note.
        Updates updated_at timestamp.
        """
        ticket = TicketService.get_ticket_by_id(db, ticket_id)
        if not ticket:
            return None

        now = datetime.now(timezone.utc)

        # Update status if provided
        if update_data.status:
            ticket.status = update_data.status

        # Append note if provided and non-empty
        if update_data.notes and update_data.notes.strip():
            note = Note(
                ticket_id=ticket.ticket_id,
                note_text=update_data.notes.strip(),
                created_at=now
            )
            db.add(note)

        ticket.updated_at = now
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def generate_ai_insights(db: Session, ticket_id: str) -> Optional[Ticket]:
        """Generates or refreshes AI insights for an existing ticket."""
        ticket = TicketService.get_ticket_by_id(db, ticket_id)
        if not ticket:
            return None

        from app.services.ai_service import AIService
        ai_data = AIService.analyze_ticket(
            customer_name=ticket.customer_name,
            subject=ticket.subject,
            description=ticket.description
        )

        ticket.ai_category = ai_data.get("category")
        ticket.ai_priority = ai_data.get("priority")
        ticket.ai_sentiment = ai_data.get("sentiment")
        ticket.ai_suggested_response = ai_data.get("suggested_response")

        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def add_note_to_ticket(db: Session, ticket_id: str, note_text: str) -> Optional[Note]:
        """Appends a new chronological note to a ticket."""
        ticket = TicketService.get_ticket_by_id(db, ticket_id)
        if not ticket:
            return None

        now = datetime.now(timezone.utc)
        note = Note(
            ticket_id=ticket.ticket_id,
            note_text=note_text.strip(),
            created_at=now
        )
        db.add(note)
        ticket.updated_at = now
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete_ticket(db: Session, ticket_id: str) -> bool:
        """Deletes a ticket and cascades deletion to all associated notes."""
        ticket = TicketService.get_ticket_by_id(db, ticket_id)
        if not ticket:
            return False
        db.delete(ticket)
        db.commit()
        return True
