from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.user import User
from app.schemas.inventory_transfer import (
    TransferCreate,
    TransferOut,
)
from app.services.inventory_transfer_service import inventory_transfer_service

router = APIRouter(prefix="/transfers", tags=["Inventory Transfers"])


@router.get("", response_model=dict)
def get_transfers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves all inventory transfers.
    Protected: Requires valid JWT.
    """
    transfers = inventory_transfer_service.get_all_transfers(db)
    serialized_data = [TransferOut.model_validate(t) for t in transfers]
    return success_response(
        data=serialized_data, message="Inventory transfers retrieved successfully"
    )


@router.get("/{id}", response_model=dict)
def get_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single inventory transfer by ID.
    Protected: Requires valid JWT.
    """
    transfer = inventory_transfer_service.get_transfer_by_id(db, id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Creates a new inventory transfer in requested status.
    Protected: Requires valid JWT.
    """
    # Safe user ID extraction to support both dict and model object types
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    transfer = inventory_transfer_service.create_transfer(db, transfer_in, created_by=user_id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer created successfully",
    )


@router.post("/{id}/approve", response_model=dict)
def approve_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Approves a requested transfer.
    Protected: Requires Admin role.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    transfer = inventory_transfer_service.approve_transfer(db, id, user_id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer approved successfully",
    )


@router.post("/{id}/ship", response_model=dict)
def ship_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Ships an approved transfer, setting status to in_transit.
    Protected: Requires valid JWT.
    """
    transfer = inventory_transfer_service.ship_transfer(db, id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer is now in transit",
    )


@router.post("/{id}/complete", response_model=dict)
def complete_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Completes an in-transit transfer, updating stock levels in both warehouses.
    Protected: Requires valid JWT.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    transfer = inventory_transfer_service.complete_transfer(db, id, user_id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer completed successfully and stock updated",
    )


@router.post("/{id}/cancel", response_model=dict)
def cancel_transfer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Cancels a requested or approved transfer.
    Protected: Requires valid JWT.
    """
    user_id = current_user.id if hasattr(current_user, "id") else current_user["id"]
    transfer = inventory_transfer_service.cancel_transfer(db, id, user_id)
    return success_response(
        data=TransferOut.model_validate(transfer),
        message="Inventory transfer cancelled successfully",
    )
