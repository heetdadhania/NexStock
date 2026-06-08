from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.stock_movement import MovementType
from app.repositories.stock_movement_repository import stock_movement_repository
from app.schemas.inventory import (
    InventoryOut,
    StockInRequest,
    StockMovementOut,
    StockOutRequest,
)
from app.services.inventory_service import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=dict)
def get_inventory(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves inventory levels for all active products.
    Protected: Requires valid JWT.
    """
    items = inventory_service.get_inventory_list(db)
    serialized_data = [InventoryOut.model_validate(item) for item in items]
    return success_response(
        data=serialized_data, message="Inventory levels retrieved successfully"
    )


@router.get("/movements", response_model=dict)
def get_stock_movements(
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    movement_type: Optional[MovementType] = Query(None, alias="type", description="Filter by IN/OUT type"),
    from_date: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves all logged stock movements matching filter criteria.
    Protected: Requires valid JWT.
    """
    movements = stock_movement_repository.get_all(
        db,
        product_id=product_id,
        movement_type=movement_type,
        from_date=from_date,
        to_date=to_date,
    )
    serialized_data = [StockMovementOut.model_validate(m) for m in movements]
    return success_response(
        data=serialized_data, message="Stock movements retrieved successfully"
    )


@router.get("/{product_id}", response_model=dict)
def get_inventory_detail(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves current stock detail and safety limits for a single product.
    Protected: Requires valid JWT.
    """
    item = inventory_service.get_inventory_detail(db, product_id)
    return success_response(
        data=InventoryOut.model_validate(item),
        message="Product inventory retrieved successfully",
    )


@router.post("/stock-in", response_model=dict, status_code=status.HTTP_200_OK)
def stock_in(
    request: StockInRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Logs an increase in stock for a product.
    Protected: Requires valid JWT.
    """
    movement = inventory_service.stock_in(db, request, created_by=current_user["id"])
    return success_response(
        data=StockMovementOut.model_validate(movement),
        message="Stock added successfully",
    )


@router.post("/stock-out", response_model=dict, status_code=status.HTTP_200_OK)
def stock_out(
    request: StockOutRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Logs a decrease in stock for a product.
    Validates against negative stock counts.
    Protected: Requires valid JWT.
    """
    movement = inventory_service.stock_out(db, request, created_by=current_user["id"])
    return success_response(
        data=StockMovementOut.model_validate(movement),
        message="Stock removed successfully",
    )
