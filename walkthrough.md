# Customer Support Ticketing CRM - Technical Interview Walkthrough

This document is a comprehensive technical guide to the architecture, database design, REST APIs, frontend implementation, deployment configuration, and design tradeoffs of the Customer Support Ticketing CRM built for the **AI + Tech Intern position at Datastraw Technologies**.

---

## 1. Project Overview & Problem Being Solved

### The Problem
E-commerce support teams face high volumes of incoming customer inquiries regarding missing orders, refund requests, payment problems, and damaged goods. Without a dedicated CRM tool, customer requests are lost across emails or spreadsheets, resolution status is opaque, multiple agents duplicate work or clobber each other's updates, and response latency degrades customer satisfaction.

### The Solution
A full-stack, web-based **Customer Support Ticketing CRM** that enables support agents to:
1. Intake and validate customer tickets with automatic, human-readable ID generation (`TKT-001`).
2. Search across customer records in real time (by name, email, ticket ID, or issue description).
3. Filter tickets by lifecycle status (`Open`, `In Progress`, `Closed`).
4. View complete ticket details with clean separation of customer statements from agent notes.
5. Update ticket statuses dynamically.
6. Append chronological internal communication notes without overwriting previous history.
7. Leverage deterministic, fault-tolerant ticket intelligence (automatic classification of category, priority, sentiment, and drafted response).

---

## 2. Technology Stack & Decision Rationale

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Backend** | Python 3.12, FastAPI, Uvicorn | High-performance asynchronous REST API framework with native Pydantic type validation and automatic OpenAPI/Swagger generation. |
| **ORM & Database** | SQLAlchemy 2.0, SQLite 3 | Lightweight relational database with zero setup overhead. Configured with explicit `PRAGMA foreign_keys=ON;` connection listeners and volume mount paths (`/data/crm.db`) for production persistence on Railway. |
| **Data Validation** | Pydantic V2 | Enforces strict schemas, email syntax, non-blank string sanitization, and structured HTTP error serialization. |
| **Frontend** | React 18, Vite | Fast development environment with rapid build times, predictable unidirectional data flow, and modern component composition. |
| **Styling** | Tailwind CSS v3, Lucide Icons | Clean internal-tool design system with semantic status chips, responsive tables, and accessibility-first contrast. |
| **Deployment** | Docker & Railway.app | Multi-stage Docker container packaging both the React SPA and FastAPI backend into a single deployable unit. |

---

## 3. Architecture & Data Flow

```
                      ┌──────────────────────────────────────────────┐
                      │            Browser (React SPA)               │
                      │  • State: tickets, stats, search, filters    │
                      │  • Services: api.js (Dynamic Base URL)       │
                      └──────────────────────┬───────────────────────┘
                                             │
                                     HTTP REST (JSON)
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │              FastAPI Backend                 │
                      │  ├── CORS Middleware (Environment Origins)   │
                      │  ├── Routes: /api/tickets, /health           │
                      │  └── Exception Handlers (400, 404, 422, 500) │
                      └──────────────────────┬───────────────────────┘
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │             Service Layer                    │
                      │  ├── TicketService (CRUD, Search, Filter)    │
                      │  └── AIService (Fault-Tolerant Intelligence) │
                      └──────────────────────┬───────────────────────┘
                                             │
                                     SQLAlchemy ORM
                               (PRAGMA foreign_keys = ON)
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │              SQLite Database                 │
                      │  ├── tickets (id PK, ticket_id UNIQUE, ...)  │
                      │  └── notes (id PK, ticket_id FK, ...)        │
                      └──────────────────────────────────────────────┘
```

---

## 4. Database Schema & Relational Integrity

### Schema Definition

```
┌────────────────────────────────────────┐         ┌────────────────────────────────────────┐
│               tickets                  │         │                 notes                  │
├────────────────────────────────────────┤         ├────────────────────────────────────────┤
│ id                    INTEGER (PK)     │ 1     * │ id                    INTEGER (PK)     │
│ ticket_id             VARCHAR (UNIQUE) ├─────────┤ ticket_id             VARCHAR (FK)     │
│ customer_name         VARCHAR (INDEX)  │         │ note_text             TEXT (NOT NULL)  │
│ customer_email        VARCHAR (INDEX)  │         │ created_at            DATETIME (INDEX) │
│ subject               VARCHAR (NOT NULL│         └────────────────────────────────────────┘
│ description           TEXT (NOT NULL)  │
│ status                VARCHAR (INDEX)  │
│ created_at            DATETIME (INDEX) │
│ updated_at            DATETIME         │
│ ai_category           VARCHAR (NULL)   │
│ ai_priority           VARCHAR (NULL)   │
│ ai_sentiment          VARCHAR (NULL)   │
│ ai_suggested_response TEXT (NULL)      │
└────────────────────────────────────────┘
```

### Key Relational Features
1. **Surrogate PK vs. Business ID**:
   - `id`: Internal integer primary key for high-speed indexing and storage efficiency.
   - `ticket_id`: Unique string (`TKT-001`, `TKT-002`) exposed to users and APIs.
2. **One-to-Many Relationship**:
   - Every note references `tickets.ticket_id` via a foreign key constraint.
   - Configured with `ondelete="CASCADE"` and `cascade="all, delete-orphan"`. Deleting a ticket cleanly removes all associated notes.
3. **Explicit SQLite Foreign Key Enforcement**:
   - In SQLite, foreign key enforcement is disabled by default.
   - Our `database.py` attaches a connection listener to SQLAlchemy's engine:
     ```python
     @event.listens_for(engine, "connect")
     def set_sqlite_pragma(dbapi_connection, connection_record):
         cursor = dbapi_connection.cursor()
         cursor.execute("PRAGMA foreign_keys=ON;")
         cursor.close()
     ```
4. **Timezone-Aware UTC Timestamps**:
   - All timestamps (`created_at`, `updated_at`) are generated via `datetime.now(timezone.utc)`.

---

## 5. REST API Specifications

| Method | Endpoint | Status | Description |
|---|---|---|---|
| `GET` | `/health` | 200 | Health check for Railway container readiness. |
| `POST` | `/api/tickets` | 201 | Creates ticket with auto-generated ID, default `Open` status, and UTC timestamps. |
| `GET` | `/api/tickets` | 200 | Lists tickets with optional `?status=` and `?search=` query parameters. |
| `GET` | `/api/tickets/{ticket_id}` | 200 / 404 | Retrieves ticket details and all associated notes. |
| `PUT` | `/api/tickets/{ticket_id}` | 200 / 400 / 404 | Updates ticket status (`Open`, `In Progress`, `Closed`) and/or appends a note. Returns 400 on invalid status. |
| `POST` | `/api/tickets/{ticket_id}/notes` | 201 / 404 | Dedicated endpoint to add an internal note. |
| `POST` | `/api/tickets/{ticket_id}/ai-insights`| 200 / 404 | Generates or refreshes AI intelligence for a ticket. |

---

## 6. Detailed Implementation Flows

### A. Ticket Creation Flow
1. **User Submission**: Support agent fills out Customer Name, Customer Email, Subject, and Description.
2. **Client Validation**: React form validates required fields and email syntax before sending the request.
3. **Pydantic Validation**: Backend trims leading/trailing whitespace, validates non-empty strings, and verifies RFC-compliant email formatting via `EmailStr`.
4. **Ticket ID Generation**: `generate_next_ticket_id(db)` queries the latest ticket ID, parses the numeric suffix, increments it (`TKT-001` &rarr; `TKT-002`), and checks for uniqueness.
5. **Auxiliary AI Enrichment**: `AIService` inspects subject and description to classify category, priority, sentiment, and draft a response inside an isolated `try...except` block.
6. **Database Persistence**: Ticket is committed to SQLite and returned to client with HTTP 201 Created.

### B. Search & Status Filtering Flow
1. **Frontend Debouncing**: As the agent types in the search bar, input is debounced by 250ms to prevent request spam.
2. **Combined Parameters**: Query parameters are combined (e.g. `/api/tickets?status=Open&search=Rahul`).
3. **Server-Side Query Execution**:
   - Status filtering: `func.lower(Ticket.status) == clean_status.lower()`
   - Multi-field search:
     ```python
     term = f"%{search.strip().lower()}%"
     query.filter(
         or_(
             func.lower(Ticket.customer_name).like(term),
             func.lower(Ticket.ticket_id).like(term),
             func.lower(Ticket.customer_email).like(term),
             func.lower(Ticket.description).like(term),
         )
     )
     ```
4. **Order**: Results are returned ordered by `created_at DESC` (newest tickets first).

### C. Status Update Flow
1. Agent clicks a status badge (`Open`, `In Progress`, or `Closed`) on the ticket detail page.
2. Request is sent via `PUT /api/tickets/{ticket_id}` with `{"status": "In Progress"}`.
3. Backend validates that status is one of the allowed values:
   - If invalid: Returns **HTTP 400 Bad Request** (`Invalid status value. Allowed values: Open, In Progress, Closed.`).
   - If ticket not found: Returns **HTTP 404 Not Found**.
   - If valid: Updates `ticket.status`, updates `ticket.updated_at = utcnow()`, commits to database, and returns 200 OK.
4. Frontend displays an animated "Updated" confirmation chip and refreshes KPI cards.

### D. Internal Notes Creation Flow
1. Agent enters a note in the "Internal Support Notes" form and clicks "Add Note".
2. Frontend submits via `POST /api/tickets/{ticket_id}/notes` (or `PUT /api/tickets/{ticket_id}` with `notes` field).
3. Backend verifies ticket existence (404 if missing), creates a new `Note` row referencing `ticket_id`, sets `created_at`, updates `ticket.updated_at`, and commits.
4. Notes are returned chronologically in the timeline; previous notes are strictly preserved without being overwritten.

---

## 7. Standout Feature: AI Ticket Intelligence

### Architecture & Isolation
The AI intelligence engine is completely decoupled from the critical CRUD path.
- **Guarantee**: Ticket creation, listing, status updates, and note logging will NEVER fail due to an AI timeout, rate limit, or network outage.
- **Implementation**:
  - `AIService.analyze_ticket()` evaluates the text inside a top-level exception barrier.
  - If no external API key is provided, it uses a deterministic heuristic classification engine:
    - **Category**: Classifies into *Billing & Refund*, *Shipping & Logistics*, *Technical Support*, *Product Issue*, or *General Inquiry*.
    - **Priority**: Determines *High*, *Medium*, or *Low* based on urgency indicators (e.g. delayed shipments, payment disputes).
    - **Sentiment**: Scores negative vs. positive keywords to output *Negative*, *Neutral*, or *Positive*.
    - **Suggested Response**: Drafts an empathetic, contextual initial reply addressing the customer by name.
  - The support agent can click **"Copy"** or **"Use as Note"** to immediately convert the AI suggested response into an internal note or communication draft.

---

## 8. Railway Deployment & Persistence Strategy

### The SQLite Persistence Problem
In ephemeral container runtimes (like default Docker containers on Railway), container filesystems are wiped on restart, crash, or redeployment. Storing SQLite inside the local application folder would cause all tickets to disappear on redeploy.

### The Solution: Persistent Railway Volumes
1. A persistent volume is mounted to the Railway service at `/data`.
2. The environment variable is configured as:
   ```env
   DATABASE_URL=sqlite:////data/crm.db
   ```
3. `backend/app/database.py` inspects the directory path on startup and automatically ensures `/data` exists before initializing tables.
4. SQLite data is preserved 100% across container restarts and redeployments.

### Unified Container Architecture
A multi-stage `Dockerfile` compiles the React frontend with Vite in Stage 1, copies the compiled assets to `/app/frontend/dist` in Stage 2, and FastAPI natively serves both the REST API (`/api/*`) and the static SPA (`/`). This eliminates CORS configuration issues in production and allows deployment within Railway's single-service tier.

---

## 9. Testing Strategy

The repository contains automated unit and integration tests using `pytest` and FastAPI's `TestClient`:
- `test_health.py`: Verifies `/health` responds with `{"status": "ok"}`.
- `test_models.py`: Validates model creation, unique ticket ID generation, and relationships.
- `test_api.py`:
  - `test_ticket_crud_and_search_flow`: Verifies ticket creation, listing, search across name, ID, email, and description, status updates, notes appending, and combined search + filter.
  - `test_api_validations_and_errors`: Tests invalid email formats (422), missing required fields (422), empty whitespace strings (422), unknown ticket IDs (404), invalid status values (400), and adding notes to non-existent tickets (404).
  - `test_ai_insights_feature_and_fallback`: Verifies AI ticket analysis and resilient fallback handling.
  - `test_cascading_delete`: Verifies that deleting a ticket cascades and deletes all associated notes in SQLite with foreign keys enabled.

To run the automated tests:
```bash
cd backend
venv\Scripts\pytest -v
```

---

## 10. Known Limitations & Future Improvements

1. **Role-Based Access Control (RBAC)**: Currently, any user can view and edit tickets. In a production enterprise setting, authentication (JWT/OAuth2) with roles (Admin, Agent, Viewer) would be added.
2. **File Attachments**: Adding support for customers or agents to attach screenshots or invoice PDFs (stored in AWS S3 or Cloudflare R2).
3. **Real-time WebSockets**: Adding WebSocket notifications so agents see incoming tickets or status changes in real time without manual page refresh.
4. **Pagination**: As the database grows beyond thousands of tickets, cursor-based pagination on `/api/tickets` will optimize memory and load times.
