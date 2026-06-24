from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.user import User
from app.schemas.warehouse import WarehouseCreate, WarehouseListOut, WarehouseOut, WarehouseUpdate
from app.services.warehouse_service import warehouse_service

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("", response_model=dict)
def get_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves all warehouses.
    Protected: Requires valid JWT.
    """
    warehouses = warehouse_service.get_all_warehouses(db)
    serialized_data = [WarehouseListOut.model_validate(w) for w in warehouses]
    return success_response(
        data=serialized_data, message="Warehouses retrieved successfully"
    )


@router.get("/{id}", response_model=dict)
def get_warehouse(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single warehouse by ID.
    Protected: Requires valid JWT.
    """
    warehouse = warehouse_service.get_warehouse_by_id(db, id)
    return success_response(
        data=WarehouseOut.model_validate(warehouse),
        message="Warehouse retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    warehouse_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Creates a new warehouse.
    Protected: Requires Admin role only.
    """
    warehouse = warehouse_service.create_warehouse(db, warehouse_in, current_user.id)
    return success_response(
        data=WarehouseOut.model_validate(warehouse),
        message="Warehouse created successfully",
    )


@router.put("/{id}", response_model=dict)
def update_warehouse(
    id: int,
    warehouse_in: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Updates an existing warehouse.
    Protected: Requires Admin role only.
    """
    warehouse = warehouse_service.update_warehouse(db, id, warehouse_in, current_user.id)
    return success_response(
        data=WarehouseOut.model_validate(warehouse),
        message="Warehouse updated successfully",
    )
