# Customer Support Ticketing CRM

A production-minded, full-stack web application built for e-commerce and customer-support operations. Enables support teams to intake customer inquiries, track ticket resolution, search and filter across customer records, collaborate via internal chronological notes, and leverage isolated AI ticket intelligence.

Built for the **AI + Tech Intern Hiring Evaluation at Datastraw Technologies**.

---

## Deployment & Repository Links

- **Live Application URL**: `https://your-railway-app.up.railway.app` *(Placeholder - configured upon Railway deploy)*
- **GitHub Repository**: `https://github.com/your-username/datastraw-crm` *(Placeholder)*

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
                          (PRAGMA foreign_keys = ON)
                                       │
                  ┌────────────────────▼────────────────────┐
                  │             SQLite Database             │
                  │   ├── tickets (PK id, ticket_id, ...)   │
                  │   └── notes (PK id, FK ticket_id, ...)  │
                  └─────────────────────────────────────────┘
```

---

## Folder Structure

```text
datastraw/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # Settings via Pydantic BaseSettings
│   │   ├── database.py           # Engine, SQLite PRAGMA hook, sessionmaker
│   │   ├── main.py               # FastAPI entrypoint, CORS, lifespan, SPA serving
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── ticket.py         # SQLAlchemy Ticket & Note models
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── tickets.py        # REST endpoints (/api/tickets)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── ticket.py         # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py     # Fault-tolerant ticket intelligence
│   │   │   └── ticket_service.py # Core business & query logic
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── ticket_id.py      # Unique TKT-001 ID sequence generator
│   ├── tests/
│   │   ├── test_api.py           # Integration tests for all CRUD & validation
│   │   ├── test_health.py        # Healthcheck endpoint test
│   │   ├── test_models.py        # Model and relationship tests
│   │   └── manual_e2e.py         # Full live server verification script
│   ├── pytest.ini
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx         # Status, priority & sentiment badges
│   │   │   ├── CreateTicketModal.jsx # Form with live field validation
│   │   │   ├── Navbar.jsx        # App header & server connectivity indicator
│   │   │   ├── SearchBar.jsx     # Debounced search & status filter tabs
│   │   │   ├── StatCards.jsx     # KPI summary cards (Total, Open, In Progress, Closed)
│   │   │   ├── TicketDetail.jsx  # Detailed ticket view, status switcher & notes
│   │   │   └── TicketList.jsx    # Table layout with loading/empty states
│   │   ├── services/
│   │   │   └── api.js            # API client with production-safe relative fallback
│   │   ├── App.jsx               # Root application router and state
│   │   ├── index.css             # Tailwind directives
│   │   └── main.jsx              # React DOM mounting
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
├── Dockerfile                    # Multi-stage production container build
├── railway.json                  # Railway deployment configuration
├── walkthrough.md                # Comprehensive technical interview guide
├── README.md                     # Documentation
└── .gitignore                    # Robust hygiene rules (no venv, node_modules, db, secrets)
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
   - Supported both via `PUT /api/tickets/{ticket_id}` and `POST /api/tickets/{ticket_id}/notes`.
   - Auto-timestamped chronological notes history.
7. **Health & Readiness Check**:
   - `GET /health` endpoint for monitoring and cloud healthchecks.

### Standout Feature: AI Ticket Intelligence (Isolated & Fault-Tolerant)
- Automatically categorizes tickets (e.g. *Shipping & Logistics*, *Billing & Refund*, *Technical Support*).
- Predicts issue priority (*High*, *Medium*, *Low*) and customer sentiment (*Positive*, *Neutral*, *Negative*).
- Generates a drafted suggested agent response that can be copied or applied as an internal note in one click.
- **Honest Architectural Guarantee**: Implemented using a deterministic heuristic classification engine with optional external LLM provider integration. Wrapped in top-level exception barriers so third-party failures can never prevent ticket creation or CRM CRUD.

---

## Database Schema

```
┌───────────────────────────────────────┐         ┌───────────────────────────────────────┐
│               tickets                 │         │                notes                  │
├───────────────────────────────────────┤         ├───────────────────────────────────────┤
│ id                    INTEGER (PK)    │ 1     * │ id                    INTEGER (PK)    │
│ ticket_id             VARCHAR (UNIQUE)├─────────┤ ticket_id             VARCHAR (FK)    │
│ customer_name         VARCHAR (INDEX) │         │ note_text             TEXT (NOT NULL) │
│ customer_email        VARCHAR (INDEX) │         │ created_at            DATETIME (INDEX)│
│ subject               VARCHAR (NOT NULL│        └───────────────────────────────────────┘
│ description           TEXT (NOT NULL) │
│ status                VARCHAR (INDEX) │
│ created_at            DATETIME (INDEX)│
│ updated_at            DATETIME        │
│ ai_category           VARCHAR (NULL)  │
│ ai_priority           VARCHAR (NULL)  │
│ ai_sentiment          VARCHAR (NULL)  │
│ ai_suggested_response TEXT (NULL)     │
└───────────────────────────────────────┘
```

- **One-to-Many Relationship**: One `Ticket` has zero or many `Notes`. Deleting a ticket cascades to its associated notes (`ondelete="CASCADE"`).
- **Sequential Ticket IDs**: Enforced with regex-based auto-incrementing logic (`TKT-001`, `TKT-002`, ...).
- **SQLite Foreign Keys**: Explicitly enabled on every connection via SQLAlchemy connection listener (`PRAGMA foreign_keys=ON;`).

---

## API Documentation

| Method | Endpoint | Success Status | Description |
|---|---|---|---|
| `GET` | `/health` | 200 | Health check for readiness monitoring |
| `POST` | `/api/tickets` | 201 | Create ticket with auto-generated ID & timestamps |
| `GET` | `/api/tickets` | 200 | List tickets with optional `?status=` and `?search=` filters |
| `GET` | `/api/tickets/{ticket_id}` | 200 | Retrieve full ticket details and notes history |
| `PUT` | `/api/tickets/{ticket_id}` | 200 | Update status and/or append internal note |
| `POST` | `/api/tickets/{ticket_id}/notes` | 201 | Dedicated endpoint to add an internal note |
| `POST` | `/api/tickets/{ticket_id}/ai-insights` | 200 | Generate or re-analyze AI ticket insights |

### Example Curl Commands

#### 1. Create Ticket
```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Rahul Sharma",
    "customer_email": "rahul@gmail.com",
    "subject": "Order has not arrived",
    "description": "My order was expected yesterday but I have not received it."
  }'
```

#### 2. Search and Filter Tickets
```bash
# Search by name with status filter
curl "http://localhost:8000/api/tickets?status=Open&search=Rahul"

# Search by ticket ID
curl "http://localhost:8000/api/tickets?search=TKT-001"
```

#### 3. Update Status
```bash
curl -X PUT http://localhost:8000/api/tickets/TKT-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'
```

#### 4. Add Internal Note
```bash
curl -X POST http://localhost:8000/api/tickets/TKT-001/notes \
  -H "Content-Type: application/json" \
  -d '{"note_text": "Contacted courier support team in Mumbai hub."}'
```

---

## Local Setup & Development

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`
Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will open at: `http://localhost:5173`

### 3. Running Automated Tests
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
| `VITE_API_BASE_URL`| *(empty)* | Optional explicit API URL for frontend. Defaults to relative `/` in production. |

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
4. This eliminates CORS complexities in production and runs within Railway's single-service tier.

---

## Known Limitations & Future Improvements

1. **Authentication & RBAC**: Currently designed for internal trust. Production upgrades would introduce JWT authentication with role-based permissions (Admin vs Agent).
2. **File Attachments**: Adding support for customers or agents to attach screenshots or invoice PDFs (via AWS S3 or Cloudflare R2).
3. **Real-time Updates**: Adding WebSockets for live push notifications when new tickets are created or updated.
4. **Pagination**: Adding cursor-based pagination to `/api/tickets` when ticket volumes reach tens of thousands.
