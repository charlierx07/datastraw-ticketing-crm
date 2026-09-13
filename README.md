# Customer Support Ticketing CRM

A production-minded, full-stack web application built for e-commerce and customer-support operations. Enables support teams to intake customer inquiries, track ticket resolution, search and filter across customer records, collaborate via internal chronological notes, and leverage isolated AI ticket intelligence.

Built for the **AI + Tech Intern Hiring Evaluation at Datastraw Technologies**.

---

## Architecture Overview

```
                  ┌─────────────────────────────────────────┐
                  │    React Single Page Application        │
                  │       (Vite + Tailwind CSS)             │
                  └────────────────────┬────────────────────┘
                                       │
                              HTTP REST Requests
                                (JSON Payloads)
                                       │
                  ┌────────────────────▼────────────────────┐
                  │          FastAPI Backend Engine         │
                  │   ├── Router (/api/tickets, /health)    │
                  │   ├── Pydantic V2 Validation Layer      │
                  │   ├── Service Layer (CRUD + Search)     │
                  │   └── AIService (Fault-Tolerant Engine) │
                  └────────────────────┬────────────────────┘
                                       │
                               SQLAlchemy 2.0
                                       │
                  ┌────────────────────▼────────────────────┐
                  │             SQLite Database             │
                  │   ├── tickets (PK id, ticket_id, ...)   │
                  │   └── notes (PK id, FK ticket_id, ...)  │
                  └─────────────────────────────────────────┘
```

---

## Features

### Core P0 Capabilities
1. **Create Customer Support Tickets**:
   - Clean, validated ticket submission interface.
   - Real-time client-side and server-side validation (email syntax, whitespace trimming, non-empty text).
   - Automatic human-readable ticket ID generation (`TKT-001`, `TKT-002`, ...).
   - Default status initialization to `Open`.
   - Automatic UTC timestamp generation.
2. **List & Dashboard Overview**:
   - Interactive table with status badges and creation timestamps.
   - Dynamic KPI summary cards (Total Tickets, Open, In Progress, Closed) derived from live data.
   - Skeleton loading states, graceful network error states, and empty inbox states.
3. **Live Case-Insensitive Search**:
   - Debounced real-time search querying the backend API.
   - Simultaneously searches across **Customer Name**, **Ticket ID**, **Customer Email**, and **Ticket Description**.
4. **Status Filtering**:
   - Fast filter switches (`All`, `Open`, `In Progress`, `Closed`).
   - Seamlessly combines with the search bar (e.g. `GET /api/tickets?status=Open&search=Rahul`).
5. **Detailed Ticket View**:
   - Full ticket metadata display with clear visual hierarchy separating customer description from agent communication.
   - One-click status switcher (`Open` &rarr; `In Progress` &rarr; `Closed`).
6. **Internal Collaboration Notes**:
   - Support agents can log internal timeline notes without modifying or overwriting previous notes.
   - Auto-timestamped chronological notes history.
7. **Health & Readiness Check**:
   - `GET /health` endpoint for monitoring and cloud healthchecks.

### Standout Feature: AI Ticket Intelligence (Isolated & Fault-Tolerant)
- Automatically categorizes tickets (e.g. *Shipping & Logistics*, *Billing & Refund*, *Technical Support*).
- Predicts issue priority (*High*, *Medium*, *Low*) and customer sentiment (*Positive*, *Neutral*, *Negative*).
- Generates a drafted suggested agent response that can be copied or applied as an internal note in one click.
- **Resilience Guarantee**: If the AI model or API is unavailable, ticket creation and CRM CRUD continue 100% uninterrupted.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Backend** | Python 3.12, FastAPI, Uvicorn | High performance asynchronous REST API with automatic OpenAPI documentation and strict type annotations. |
| **Data Validation** | Pydantic V2 | Type enforcement, email format validation, and standardized HTTP error serialization. |
| **Database & ORM** | SQLite 3, SQLAlchemy 2.0 | Lightweight, zero-config relational database with explicit foreign key relationships and volume mount support. |
| **Frontend** | React 18, Vite | Fast development experience, instant HMR, and optimized production bundle. |
| **Styling** | Tailwind CSS v3, Lucide Icons | Responsive internal tool UI with clear badge semantics and clean typography. |
| **Deployment** | Docker & Railway.app | Multi-stage Docker build packaging frontend SPA and backend API into a unified deployable service. |

---

## Database Schema

```
┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐
│               tickets                 │         │                notes                  │
├───────────────────────────────────────┤         ├───────────────────────────────────────┤
│ id                    INTEGER (PK)    │ 1     * │ id                    INTEGER (PK)    │
│ ticket_id             VARCHAR (UNIQUE)├─────────┤ ticket_id             VARCHAR (FK)    │
│ customer_name         VARCHAR (NOT NULL)│       │ note_text             TEXT (NOT NULL) │
│ customer_email        VARCHAR (NOT NULL)│       │ created_at            DATETIME        │
│ subject               VARCHAR (NOT NULL)│       └───────────────────────────────────────┘
│ description           TEXT (NOT NULL) │
│ status                VARCHAR (NOT NULL)│
│ created_at            DATETIME        │
│ updated_at            DATETIME        │
│ ai_category           VARCHAR (NULL)  │
│ ai_priority           VARCHAR (NULL)  │
│ ai_sentiment          VARCHAR (NULL)  │
│ ai_suggested_response TEXT (NULL)     │
└───────────────────────────────────────┘
```

- **One-to-Many Relationship**: One `Ticket` has zero or many `Notes`. Deleting a ticket cascades to its associated notes (`ondelete="CASCADE"`).
- **Sequential Ticket IDs**: Enforced with regex-based auto-incrementing logic (`TKT-001`, `TKT-002`, ...).

---

## API Documentation

### 1. Health Check
```http
GET /health
```
**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### 2. Create Ticket
```http
POST /api/tickets
Content-Type: application/json
```
**Request Body:**
```json
{
  "customer_name": "Rahul Sharma",
  "customer_email": "rahul@gmail.com",
  "subject": "Order has not arrived",
  "description": "My order was expected yesterday but I haven't received it."
}
```
**Response (201 Created):**
```json
{
  "ticket_id": "TKT-001",
  "created_at": "2026-09-12T14:19:40.123456Z"
}
```

---

### 3. List & Search Tickets
```http
GET /api/tickets?status=Open&search=Rahul
```
**Response (200 OK):**
```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "Rahul Sharma",
    "customer_email": "rahul@gmail.com",
    "subject": "Order has not arrived",
    "status": "Open",
    "created_at": "2026-09-12T14:19:40.123456Z"
  }
]
```

---

### 4. Get Ticket Details
```http
GET /api/tickets/TKT-001
```
**Response (200 OK):**
```json
{
  "ticket_id": "TKT-001",
  "customer_name": "Rahul Sharma",
  "customer_email": "rahul@gmail.com",
  "subject": "Order has not arrived",
  "description": "My order was expected yesterday but I haven't received it.",
  "status": "Open",
  "created_at": "2026-09-12T14:19:40.123456Z",
  "updated_at": "2026-09-12T14:19:40.123456Z",
  "notes": [
    {
      "id": 1,
      "ticket_id": "TKT-001",
      "note_text": "Contacted logistics hub.",
      "created_at": "2026-09-12T14:21:00.000000Z"
    }
  ],
  "ai_category": "Shipping & Logistics",
  "ai_priority": "High",
  "ai_sentiment": "Negative",
  "ai_suggested_response": "Hi Rahul, thank you for reaching out..."
}
```

---

### 5. Update Ticket Status & Add Note
```http
PUT /api/tickets/TKT-001
Content-Type: application/json
```
**Request Body:**
```json
{
  "status": "In Progress",
  "notes": "Contacted courier support. Driver out for redelivery."
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "updated_at": "2026-09-12T14:22:15.654321Z"
}
```

---

### 6. Refresh AI Insights
```http
POST /api/tickets/TKT-001/ai-insights
```
**Response (200 OK):** Returns updated ticket object with fresh category, priority, sentiment, and draft response.

---

## Local Setup & Development

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd datastraw
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run backend development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`
Interactive Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will open at: `http://localhost:5173`

### 4. Running Automated Tests
```bash
cd backend
# With active virtual environment:
pytest -v
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_ENV` | `development` | Runtime environment (`development` / `production`). |
| `PORT` | `8000` | Port for the Uvicorn server. |
| `DATABASE_URL` | `sqlite:///./crm.db` | SQLAlchemy connection string. Use `sqlite:////data/crm.db` on Railway. |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed CORS origins. |
| `AI_PROVIDER` | `mock` | AI engine (`mock`, `gemini`, or `openai`). |
| `AI_API_KEY` | *(empty)* | Optional API key for external LLM inference. |

---

## Railway Deployment Guide

### Why SQLite Persistence on Railway Matters
By default, containerized deployments have an ephemeral filesystem. If the container restarts or redeploys, any files written directly to the container root will be wiped.

To ensure **100% data persistence** on Railway:
1. Go to your project on **[Railway.app](https://railway.app)**.
2. Select your Service &rarr; Click **Volumes** &rarr; **Add Volume**.
3. Set the Mount Path to `/data`.
4. In **Variables**, set:
   ```env
   DATABASE_URL=sqlite:////data/crm.db
   ```
5. Railway will automatically persist `crm.db` across all restarts and redeployments!

### Single Container Unified Deployment (Recommended)
This repository includes a multi-stage `Dockerfile`:
1. It builds the React SPA into static assets.
2. It installs Python dependencies and starts FastAPI.
3. FastAPI serves the compiled SPA at `/` and the REST API at `/api/*`.
4. This eliminates CORS complexities in production and runs within Railway's single-service hobby limits.

---

## Key Design Decisions & Tradeoffs

1. **FastAPI + Pydantic V2**:
   - *Decision*: Strict schema validation on input/output.
   - *Rationale*: Prevents database injection, handles whitespace edge cases cleanly, and produces self-documenting OpenAPI specs.
2. **Sequential Formatted Ticket IDs (`TKT-001`)**:
   - *Decision*: Separate integer primary key `id` from human-facing `ticket_id`.
   - *Rationale*: Internal databases use auto-incremented integer keys for performance, while human agents communicate using branded, recognizable identifiers.
3. **Dedicated Notes Table vs Array in Ticket**:
   - *Decision*: Normalized 1-to-many relational table for notes.
   - *Rationale*: Preserves chronological fidelity, allows timestamping each individual comment, and prevents race conditions from concurrent note edits.
4. **Non-Blocking AI Integration**:
   - *Decision*: AI analysis is wrapped in safe exception barriers and runs as an auxiliary service.
   - *Rationale*: A customer support ticket must NEVER fail to save because a third-party AI service timed out or hit rate limits.

---

## Evaluation / Interview Quick Reference

| Topic | Key Points to Explain |
|---|---|
| **Architecture** | Clear separation: React SPA &rarr; REST API &rarr; FastAPI Routers &rarr; Service Business Logic &rarr; SQLAlchemy & SQLite. |
| **Data Integrity** | Foreign key constraints on `notes.ticket_id`, automatic UTC timestamps, validation of non-blank fields and email formats. |
| **Search Performance** | Server-side query using `or_` with `func.lower()` across 4 indexed/text fields, debounced on frontend to conserve bandwidth. |
| **Production Resilience** | Structured HTTP error codes (404, 422, 500), CORS origin filtering, `/health` endpoint, and Railway volume persistence. |
