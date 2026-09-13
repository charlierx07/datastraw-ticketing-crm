from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ticket import (
    TicketCreate,
    TicketCreateResponse,
    TicketListItem,
    TicketDetailResponse,
    TicketUpdate,
    TicketUpdateResponse,
)
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post(
    "",
    response_model=TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new support ticket",
    description="Creates a new support ticket with auto-generated ticket ID (TKT-001...), Open status, and timestamps."
)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db)
):
    try:
        created_ticket = TicketService.create_ticket(db=db, ticket_in=ticket_in)
        return TicketCreateResponse(
            ticket_id=created_ticket.ticket_id,
            created_at=created_ticket.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )


@router.get(
    "",
    response_model=List[TicketListItem],
    status_code=status.HTTP_200_OK,
    summary="List tickets with search and status filtering",
    description="Lists all tickets with optional case-insensitive search and status filtering."
)
def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Closed, or All"),
    search: Optional[str] = Query(None, description="Search term matching name, ticket ID, email, or description"),
    db: Session = Depends(get_db)
):
    tickets = TicketService.get_tickets(db=db, status=status, search=search)
    return tickets


@router.get(
    "/{ticket_id}",
    response_model=TicketDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get ticket details by ticket ID",
    description="Returns full ticket details including all associated internal notes."
)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = TicketService.get_ticket_by_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found."
        )
    return ticket


@router.put(
    "/{ticket_id}",
    response_model=TicketUpdateResponse,
    status_code=status.HTTP_200_OK,
    summary="Update ticket status and/or add internal note",
    description="Updates ticket status and/or appends a new note to the ticket history."
)
def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    updated_ticket = TicketService.update_ticket(
        db=db,
        ticket_id=ticket_id,
        update_data=ticket_update
    )
    if not updated_ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found."
        )

    return TicketUpdateResponse(
        success=True,
        updated_at=updated_ticket.updated_at
    )


@router.post(
    "/{ticket_id}/ai-insights",
    response_model=TicketDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate or refresh AI insights for a ticket",
    description="Analyzes the ticket content to produce/refresh Category, Priority, Sentiment, and Suggested Response."
)
def generate_ai_insights(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = TicketService.generate_ai_insights(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found."
        )
    return ticket
