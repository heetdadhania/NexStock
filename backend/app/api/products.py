from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.product_service import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=dict)
def get_products(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves all active products, with optional category filtering.
    Protected: Requires valid JWT.
    """
    products = product_service.get_all_products(db, category_id)
    serialized_data = [ProductOut.model_validate(p) for p in products]
    return success_response(
        data=serialized_data, message="Products retrieved successfully"
    )


@router.get("/{product_id}", response_model=dict)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single active product with its inventory safety limits.
    Protected: Requires valid JWT.
    """
    product = product_service.get_product_by_id(db, product_id)
    return success_response(
        data=ProductOut.model_validate(product),
        message="Product retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin", "Manager"])),
) -> dict:
    """
    Creates a new product and initializes its inventory tracking.
    Protected: Requires Admin or Manager role.
    """
    product = product_service.create_product(db, product_in)
    return success_response(
        data=ProductOut.model_validate(product),
        message="Product created successfully",
    )


@router.put("/{product_id}", response_model=dict)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin", "Manager"])),
) -> dict:
    """
    Updates product specifications and safety stock limits.
    Protected: Requires Admin or Manager role.
    """
    product = product_service.update_product(db, product_id, product_in)
    return success_response(
        data=ProductOut.model_validate(product),
        message="Product updated successfully",
    )


@router.delete("/{product_id}", response_model=dict)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Soft deletes a product.
    Protected: Requires Admin role only.
    """
    product_service.delete_product(db, product_id)
    return success_response(message="Product deleted successfully")
