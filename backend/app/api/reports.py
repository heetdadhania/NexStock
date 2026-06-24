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
    WarehouseInventoryReportItem,
    SupplierReportItem,
    PurchaseOrderReportItem,
    TransferReportItem,
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


# ---------------------------------------------------------------------------
# V2 Endpoints
# ---------------------------------------------------------------------------

@router.get("/warehouse-inventory", response_model=dict)
def get_warehouse_inventory_report(
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    low_stock_only: bool = Query(False, description="Return only low-stock records"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Returns per-warehouse product inventory with low-stock flag.
    Protected: Requires valid JWT.
    """
    items = report_service.get_warehouse_inventory_report(
        db, warehouse_id=warehouse_id, low_stock_only=low_stock_only
    )
    serialized = [WarehouseInventoryReportItem.model_validate(i) for i in items]
    return success_response(data=serialized, message="Warehouse inventory report compiled successfully")


@router.get("/suppliers", response_model=dict)
def get_supplier_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Returns all suppliers with total PO count and total received-PO value.
    Protected: Requires valid JWT.
    """
    items = report_service.get_supplier_report(db)
    serialized = [SupplierReportItem.model_validate(i) for i in items]
    return success_response(data=serialized, message="Supplier report compiled successfully")


@router.get("/purchase-orders", response_model=dict)
def get_purchase_order_report(
    status: Optional[str] = Query(None, description="Filter by PO status"),
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Returns purchase orders with supplier/warehouse names and aggregated values.
    Protected: Requires valid JWT.
    """
    items = report_service.get_purchase_order_report(
        db, status=status, supplier_id=supplier_id,
        warehouse_id=warehouse_id, from_date=from_date, to_date=to_date,
    )
    serialized = [PurchaseOrderReportItem.model_validate(i) for i in items]
    return success_response(data=serialized, message="Purchase orders report compiled successfully")


@router.get("/transfers", response_model=dict)
def get_transfer_report(
    status: Optional[str] = Query(None, description="Filter by transfer status"),
    source_warehouse_id: Optional[int] = Query(None, description="Filter by source warehouse ID"),
    destination_warehouse_id: Optional[int] = Query(None, description="Filter by destination warehouse ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Returns inventory transfers with warehouse names, status, and item count.
    Protected: Requires valid JWT.
    """
    items = report_service.get_transfer_report(
        db, status=status,
        source_warehouse_id=source_warehouse_id,
        destination_warehouse_id=destination_warehouse_id,
    )
    serialized = [TransferReportItem.model_validate(i) for i in items]
    return success_response(data=serialized, message="Transfers report compiled successfully")


# V2 CSV Exports

@router.get("/export/warehouse-inventory")
def export_warehouse_inventory_csv(
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    low_stock_only: bool = Query(False, description="Return only low-stock records"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads warehouse inventory report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_warehouse_inventory_csv(
        db, warehouse_id=warehouse_id, low_stock_only=low_stock_only
    )
    headers = {"Content-Disposition": 'attachment; filename="warehouse_inventory_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get("/export/suppliers")
def export_supplier_csv(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads supplier report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_supplier_csv(db)
    headers = {"Content-Disposition": 'attachment; filename="suppliers_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get("/export/purchase-orders")
def export_purchase_orders_csv(
    status: Optional[str] = Query(None, description="Filter by PO status"),
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    from_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads purchase orders report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_purchase_orders_csv(
        db, status=status, supplier_id=supplier_id,
        warehouse_id=warehouse_id, from_date=from_date, to_date=to_date,
    )
    headers = {"Content-Disposition": 'attachment; filename="purchase_orders_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)


@router.get("/export/transfers")
def export_transfers_csv(
    status: Optional[str] = Query(None, description="Filter by transfer status"),
    source_warehouse_id: Optional[int] = Query(None, description="Filter by source warehouse ID"),
    destination_warehouse_id: Optional[int] = Query(None, description="Filter by destination warehouse ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """
    Downloads inventory transfers report as a CSV file attachment.
    Protected: Requires valid JWT.
    """
    generator = report_service.export_transfers_csv(
        db, status=status,
        source_warehouse_id=source_warehouse_id,
        destination_warehouse_id=destination_warehouse_id,
    )
    headers = {"Content-Disposition": 'attachment; filename="transfers_report.csv"'}
    return StreamingResponse(generator, media_type="text/csv", headers=headers)
