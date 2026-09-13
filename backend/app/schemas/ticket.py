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
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_sentiment: Optional[str] = None
    ai_suggested_response: Optional[str] = None
    ai_source: Optional[str] = "gemini"

    model_config = ConfigDict(from_attributes=True)


class NoteCreate(BaseModel):
    note_text: str = Field(..., min_length=1, description="Content of internal support note")

    @field_validator("note_text", mode="before")
    @classmethod
    def strip_and_validate_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v_stripped = v.strip()
            if not v_stripped:
                raise ValueError("Note text cannot be empty or only whitespace")
            return v_stripped
        return v


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
    ai_source: Optional[str] = "gemini"

    model_config = ConfigDict(from_attributes=True)


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class TicketUpdateResponse(BaseModel):
    success: bool = True
    status: Optional[str] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
