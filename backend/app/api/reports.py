from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.schemas.report import (
    InventoryReportItem,
    LowStockReportItem,
    StockMovementReportItem,
)
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/inventory", response_model=dict)
def get_inventory_report(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Compiles active product inventory levels, thresholds, and valuation reports.
    Protected: Requires valid JWT.
    """
    items = report_service.get_inventory_report(db, category_id=category_id)
    serialized_data = [InventoryReportItem.model_validate(item) for item in items]
    return success_response(
        data=serialized_data, message="Inventory report compiled successfully"
    )


@router.get("/stock-movements", response_model=dict)
def get_stock_movements_report(
    from_date: Optional[date] = Query(None, description="Start date bounds (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date bounds (YYYY-MM-DD)"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    movement_type: Optional[str] = Query(None, alias="type", description="Filter by IN/OUT type"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves stock movement transactions matching optional range and product filters.
    Protected: Requires valid JWT.
    """
    items = report_service.get_stock_movements_report(
        db,
        from_date=from_date,
        to_date=to_date,
        product_id=product_id,
        movement_type=movement_type,
    )
    serialized_data = [StockMovementReportItem.model_validate(item) for item in items]
    return success_response(
        data=serialized_data, message="Stock movements report compiled successfully"
    )


@router.get("/low-stock", response_model=dict)
def get_low_stock_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves products currently at or below safety stock limits, flagging shortages.
    Protected: Requires valid JWT.
    """
    items = report_service.get_low_stock_report(db)
    serialized_data = [LowStockReportItem.model_validate(item) for item in items]
    return success_response(
        data=serialized_data, message="Low stock report compiled successfully"
    )


@router.get("/export/inventory")
def export_inventory_csv(
    format: str = Query("csv", description="File format selector"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads inventory valuation report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_inventory_csv(db, category_id=category_id)
    headers = {"Content-Disposition": 'attachment; filename="inventory_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get("/export/stock-movements")
def export_movements_csv(
    format: str = Query("csv", description="File format selector"),
    from_date: Optional[date] = Query(None, description="Start date bounds"),
    to_date: Optional[date] = Query(None, description="End date bounds"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    movement_type: Optional[str] = Query(None, alias="type", description="Filter by IN/OUT type"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads stock movement transaction logs report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_movements_csv(
        db,
        from_date=from_date,
        to_date=to_date,
        product_id=product_id,
        movement_type=movement_type,
    )
    headers = {"Content-Disposition": 'attachment; filename="stock_movements_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get("/export/low-stock")
def export_low_stock_csv(
    format: str = Query("csv", description="File format selector"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads low stock alerts and shortages report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_low_stock_csv(db)
    headers = {"Content-Disposition": 'attachment; filename="low_stock_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)
