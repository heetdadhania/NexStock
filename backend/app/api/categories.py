from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.category_service import category_service

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=dict)
def get_categories(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves all categories.
    Protected: Requires valid JWT.
    """
    categories = category_service.get_all_categories(db)
    serialized_data = [CategoryOut.model_validate(c) for c in categories]
    return success_response(
        data=serialized_data, message="Categories retrieved successfully"
    )


@router.get("/{category_id}", response_model=dict)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves a single category by ID.
    Protected: Requires valid JWT.
    """
    category = category_service.get_category_by_id(db, category_id)
    return success_response(
        data=CategoryOut.model_validate(category),
        message="Category retrieved successfully",
    )


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin", "Manager"])),
) -> dict:
    """
    Creates a new category.
    Protected: Requires Admin or Manager role.
    """
    category = category_service.create_category(db, category_in)
    return success_response(
        data=CategoryOut.model_validate(category),
        message="Category created successfully",
    )


@router.put("/{category_id}", response_model=dict)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin", "Manager"])),
) -> dict:
    """
    Updates an existing category.
    Protected: Requires Admin or Manager role.
    """
    category = category_service.update_category(db, category_id, category_in)
    return success_response(
        data=CategoryOut.model_validate(category),
        message="Category updated successfully",
    )


@router.delete("/{category_id}", response_model=dict)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleChecker(["Admin"])),
) -> dict:
    """
    Deletes an existing category.
    Protected: Requires Admin role only.
    """
    category_service.delete_category(db, category_id)
    return success_response(message="Category deleted successfully")
