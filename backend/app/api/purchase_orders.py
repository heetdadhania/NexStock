from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.user import User
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderListOut,
    PurchaseOrderOut,
)
from app.services.purchase_order_service import purchase_order_service

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


@router.get("", response_model=dict)
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves all purchase orders.
    Protected: Requires valid JWT.
    """
    orders = purchase_order_service.get_all_orders(db)
    serialized_data = [PurchaseOrderListOut.model_validate(o) for o in orders]
    return success_response(
        data=serialized_data, message="Purchase orders retrieved successfully"
    )


@router.get("/{id}", response_model=dict)
def get_purchase_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single purchase order by ID.
    Protected: Requires valid JWT.
    """
    order = purchase_order_service.get_order_by_id(db, id)
    return success_response(
        data=PurchaseOrderOut.model_validate(order),
        message="Purchase order retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Creates a new purchase order in draft status.
    Protected: Requires valid JWT.
    """
    # Safe user ID extraction to support both dict and model object types
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    order = purchase_order_service.create_order(db, po_in, created_by=user_id)
    return success_response(
        data=PurchaseOrderOut.model_validate(order),
        message="Purchase order created successfully",
    )


@router.post("/{id}/approve", response_model=dict)
def approve_purchase_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Approves a draft purchase order.
    Protected: Requires Admin role.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    order = purchase_order_service.approve_order(db, id, user_id)
    return success_response(
        data=PurchaseOrderOut.model_validate(order),
        message="Purchase order approved successfully",
    )


@router.post("/{id}/receive", response_model=dict)
def receive_purchase_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Receives an approved purchase order and updates warehouse inventory levels.
    Protected: Requires valid JWT.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    order = purchase_order_service.receive_order(db, id, user_id)
    return success_response(
        data=PurchaseOrderOut.model_validate(order),
        message="Purchase order received successfully and inventory updated",
    )


@router.post("/{id}/cancel", response_model=dict)
def cancel_purchase_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Cancels a draft purchase order.
    Protected: Requires valid JWT.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    order = purchase_order_service.cancel_order(db, id, user_id)
    return success_response(
        data=PurchaseOrderOut.model_validate(order),
        message="Purchase order cancelled successfully",
    )
