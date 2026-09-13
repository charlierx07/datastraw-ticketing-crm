from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.routes.tickets import router as tickets_router
import app.models.ticket  # Ensures models are imported for metadata creation


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically initialize SQLite database tables on application start
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Customer Support Ticketing CRM API",
    description="Production-ready REST API for managing customer support tickets and notes.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global custom validation error handler (HTTP 422) for clean client messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        msg = err["msg"]
        errors.append({"field": field or "body", "message": msg})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"detail": "Validation error", "errors": errors}
    )


# Include REST API Routers
app.include_router(tickets_router)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service readiness."""
    return {"status": "ok"}


# Serve compiled React frontend if frontend/dist exists (supports unified single-container deployment)
import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

