from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=100, description="Full name of customer")
    customer_email: EmailStr = Field(..., description="Valid customer contact email")
    subject: str = Field(..., min_length=1, max_length=200, description="Brief issue title or summary")
    description: str = Field(..., min_length=1, description="Detailed explanation of the issue")

    @field_validator("customer_name", "subject", "description", mode="before")
    @classmethod
    def strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v_stripped = v.strip()
            if not v_stripped:
                raise ValueError("Field cannot be empty or only whitespace")
            return v_stripped
        return v


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoteResponse(BaseModel):
    id: int
    ticket_id: str
    note_text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_sentiment: Optional[str] = None
    ai_suggested_response: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_statuses = [s.value for s in TicketStatus]
            # Match case-insensitively to exact canonical casing
            match = next((s for s in valid_statuses if s.lower() == v.strip().lower()), None)
            if not match:
                raise ValueError(f"Invalid status '{v}'. Allowed values are: {', '.join(valid_statuses)}")
            return match
        return v


class TicketUpdateResponse(BaseModel):
    success: bool = True
    updated_at: datetime
