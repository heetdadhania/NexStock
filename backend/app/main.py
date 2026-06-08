import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import NexStockException
from app.core.response import error_response, success_response

# Initialize FastAPI App
app = FastAPI(
    title="NexStock - Warehouse Intelligence Platform API",
    description="Backend API for NexStock Warehouse Management System",
    version="1.0.0",
)

# Configure CORS Middleware
origins = (
    [settings.CORS_ORIGINS]
    if isinstance(settings.CORS_ORIGINS, str)
    else settings.CORS_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler for NexStock Custom Exceptions
@app.exception_handler(NexStockException)
async def nexstock_exception_handler(
    request: Request, exc: NexStockException
) -> JSONResponse:
    """
    Handles custom NexStockExceptions and maps them to standard JSON error responses.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.message),
    )


# General fallback Exception Handler
@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """
    Fallback exception handler for unhandled internal exceptions.
    """
    # In a production app, we would log the full stack trace here
    return JSONResponse(
        status_code=500,
        content=error_response(message=f"Internal Server Error: {str(exc)}"),
    )


@app.get("/")
async def root() -> dict:
    """Root endpoint verifying API server status."""
    return success_response(
        data={"status": "online", "version": "1.0.0"},
        message="NexStock Backend API is running successfully",
    )


# Include Routers
from app.api.categories import router as categories_router
from app.api.products import router as products_router
from app.api.inventory import router as inventory_router
from app.api.dashboard import router as dashboard_router
from app.api.reports import router as reports_router
from app.api.auth import router as auth_router

app.include_router(categories_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(auth_router, prefix="/api")


# Startup Event: Seed default data (roles, admin user)
from app.db.base import SessionLocal
from app.services.auth_service import seed_auth_data

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_auth_data(db)
    finally:
        db.close()

