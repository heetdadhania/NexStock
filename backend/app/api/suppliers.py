from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierListOut, SupplierOut, SupplierUpdate
from app.services.supplier_service import supplier_service

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=dict)
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves all suppliers.
    Protected: Requires valid JWT.
    """
    suppliers = supplier_service.get_all_suppliers(db)
    serialized_data = [SupplierListOut.model_validate(s) for s in suppliers]
    return success_response(
        data=serialized_data, message="Suppliers retrieved successfully"
    )


@router.get("/{id}", response_model=dict)
def get_supplier(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single supplier by ID.
    Protected: Requires valid JWT.
    """
    supplier = supplier_service.get_supplier_by_id(db, id)
    return success_response(
        data=SupplierOut.model_validate(supplier),
        message="Supplier retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_in: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Creates a new supplier.
    Protected: Requires Admin role only.
    """
    supplier = supplier_service.create_supplier(db, supplier_in, current_user.id)
    return success_response(
        data=SupplierOut.model_validate(supplier),
        message="Supplier created successfully",
    )


@router.put("/{id}", response_model=dict)
def update_supplier(
    id: int,
    supplier_in: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Updates an existing supplier.
    Protected: Requires Admin role only.
    """
    supplier = supplier_service.update_supplier(db, id, supplier_in, current_user.id)
    return success_response(
        data=SupplierOut.model_validate(supplier),
        message="Supplier updated successfully",
    )
