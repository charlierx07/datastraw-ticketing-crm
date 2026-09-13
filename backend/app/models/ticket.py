from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def get_utc_now():
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String(20), unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False, index=True)
    customer_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="Open", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Standout AI feature fields (isolated, nullable so CRUD never fails)
    ai_category = Column(String(50), nullable=True)
    ai_priority = Column(String(20), nullable=True)
    ai_sentiment = Column(String(20), nullable=True)
    ai_suggested_response = Column(Text, nullable=True)

    # 1-to-Many Relationship with notes (cascading delete)
    notes = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="desc(Note.created_at)"
    )


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(String(20), ForeignKey("tickets.ticket_id", ondelete="CASCADE"), nullable=False, index=True)
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)

    # Relationship back to Ticket
    ticket = relationship("Ticket", back_populates="notes")
