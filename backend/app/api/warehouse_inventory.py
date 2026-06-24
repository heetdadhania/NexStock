from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.schemas.warehouse_inventory import WarehouseInventoryOut, WarehouseInventoryUpdate
from app.services.warehouse_inventory_service import warehouse_inventory_service

router = APIRouter(tags=["Warehouse Inventory"])


@router.get("/warehouses/{warehouse_id}/inventory", response_model=dict)
def get_warehouse_inventory(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves all inventory items for a specific warehouse.
    Protected: Requires valid JWT.
    """
    items = warehouse_inventory_service.get_inventory_list(db, warehouse_id)
    serialized_data = [WarehouseInventoryOut.model_validate(i) for i in items]
    return success_response(
        data=serialized_data, message="Warehouse inventory retrieved successfully"
    )


@router.get("/warehouses/{warehouse_id}/inventory/{product_id}", response_model=dict)
def get_warehouse_inventory_detail(
    warehouse_id: int,
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single inventory item detail for a warehouse and product.
    Protected: Requires valid JWT.
    """
    item = warehouse_inventory_service.get_inventory_detail(db, warehouse_id, product_id)
    return success_response(
        data=WarehouseInventoryOut.model_validate(item),
        message="Warehouse inventory item retrieved successfully",
    )


@router.put("/warehouses/{warehouse_id}/inventory/{product_id}", response_model=dict)
def update_warehouse_inventory_limits(
    warehouse_id: int,
    product_id: int,
    limits_in: WarehouseInventoryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Updates the safety stock limits (min/max) for a product in a warehouse.
    Protected: Requires valid JWT.
    """
    item = warehouse_inventory_service.update_limits(db, warehouse_id, product_id, limits_in)
    return success_response(
        data=WarehouseInventoryOut.model_validate(item),
        message="Warehouse inventory limits updated successfully",
    )


@router.get("/warehouse-inventory/low-stock", response_model=dict)
def get_all_low_stock_inventory(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves all low-stock inventory records across all warehouses.
    Protected: Requires valid JWT.
    """
    items = warehouse_inventory_service.get_all_low_stock(db)
    serialized_data = [WarehouseInventoryOut.model_validate(i) for i in items]
    return success_response(
        data=serialized_data, message="Low stock inventory items retrieved successfully"
    )
