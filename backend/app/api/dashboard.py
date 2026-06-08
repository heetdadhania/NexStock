from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.schemas.dashboard import (
    DashboardStats,
    InventoryTrendPoint,
    LowStockItem,
    RecentMovement,
)
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=dict)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves key metrics for NexStock dashboard.
    Protected: Requires valid JWT.
    """
    stats = dashboard_service.get_stats(db)
    serialized_data = DashboardStats.model_validate(stats)
    return success_response(
        data=serialized_data, message="Dashboard stats retrieved successfully"
    )


@router.get("/inventory-trend", response_model=dict)
def get_inventory_trend(
    days: int = Query(30, description="Number of historical days to chart (default 30)", gt=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves daily quantities of stock-in and stock-out movements over the last N days.
    Protected: Requires valid JWT.
    """
    trend = dashboard_service.get_inventory_trend(db, days=days)
    serialized_data = [InventoryTrendPoint.model_validate(p) for p in trend]
    return success_response(
        data=serialized_data, message="Inventory trend retrieved successfully"
    )


@router.get("/low-stock", response_model=dict)
def get_low_stock_alerts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves a list of active products currently running low on stock.
    Protected: Requires valid JWT.
    """
    alerts = dashboard_service.get_low_stock_alerts(db)
    serialized_data = [LowStockItem.model_validate(item) for item in alerts]
    return success_response(
        data=serialized_data, message="Low stock items retrieved successfully"
    )


@router.get("/recent-activity", response_model=dict)
def get_recent_activity(
    limit: int = Query(10, description="Max number of movements to fetch (default 10)", gt=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves the most recent stock movement transactions.
    Protected: Requires valid JWT.
    """
    activity = dashboard_service.get_recent_activity(db, limit=limit)
    serialized_data = [RecentMovement.model_validate(item) for item in activity]
    return success_response(
        data=serialized_data, message="Recent activity retrieved successfully"
    )
