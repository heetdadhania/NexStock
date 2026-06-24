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
    V2DashboardStats,
    WarehouseInventoryDistribution,
    POStatusSummary,
    TransferActivityPoint,
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


@router.get("/v2/stats", response_model=dict)
def get_v2_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves V2 key metrics for NexStock dashboard.
    Protected: Requires valid JWT.
    """
    stats = dashboard_service.get_v2_stats(db)
    serialized_data = V2DashboardStats.model_validate(stats)
    return success_response(
        data=serialized_data, message="Dashboard V2 stats retrieved successfully"
    )


@router.get("/v2/inventory-distribution", response_model=dict)
def get_v2_inventory_distribution(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves inventory distribution by warehouse.
    Protected: Requires valid JWT.
    """
    distribution = dashboard_service.get_v2_inventory_distribution(db)
    serialized_data = [WarehouseInventoryDistribution.model_validate(d) for d in distribution]
    return success_response(
        data=serialized_data, message="Inventory distribution retrieved successfully"
    )


@router.get("/v2/po-status-summary", response_model=dict)
def get_v2_po_status_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves summary of purchase orders grouped by status.
    Protected: Requires valid JWT.
    """
    summary = dashboard_service.get_v2_po_summary(db)
    serialized_data = [POStatusSummary.model_validate(s) for s in summary]
    return success_response(
        data=serialized_data, message="PO status summary retrieved successfully"
    )


@router.get("/v2/transfer-activity", response_model=dict)
def get_v2_transfer_activity(
    days: int = Query(30, description="Number of historical days to chart (default 30)", gt=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves daily count of transfers created and completed in the last N days.
    Protected: Requires valid JWT.
    """
    activity = dashboard_service.get_v2_transfer_activity(db, days=days)
    serialized_data = [TransferActivityPoint.model_validate(p) for p in activity]
    return success_response(
        data=serialized_data, message="Transfer activity retrieved successfully"
    )
