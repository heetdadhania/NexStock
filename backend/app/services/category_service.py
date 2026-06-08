from typing import List
from sqlalchemy.orm import Session

from app.core.exceptions import (
    DuplicateException,
    NotFoundException,
    ValidationException,
)
from app.models.category import Category
from app.repositories.category_repository import category_repository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    """
    Business logic layer for Category Management.
    Enforces rules on uniqueness and constraints before executing database actions.
    """

    def get_all_categories(self, db: Session) -> List[Category]:
        """Retrieves all category records."""
        return category_repository.get_all(db)

    def get_category_by_id(self, db: Session, category_id: int) -> Category:
        """
        Retrieves a category by ID.
        Raises NotFoundException if not found.
        """
        db_category = category_repository.get_by_id(db, category_id)
        if not db_category:
            raise NotFoundException(f"Category with ID {category_id} not found")
        return db_category

    def create_category(
        self, db: Session, category_in: CategoryCreate
    ) -> Category:
        """
        Creates a new category.
        Ensures name uniqueness (case-insensitive).
        """
        if category_repository.exists_by_name(db, category_in.name):
            raise DuplicateException(
                f"Category with name '{category_in.name}' already exists"
            )
        return category_repository.create(db, category_in)

    def update_category(
        self, db: Session, category_id: int, category_in: CategoryUpdate
    ) -> Category:
        """
        Updates an existing category.
        Checks for ID existence and unique name collision.
        """
        db_category = self.get_category_by_id(db, category_id)

        # Check if name is changing and collides with another existing name
        if category_in.name and category_in.name.lower() != db_category.name.lower():
            if category_repository.exists_by_name(db, category_in.name):
                raise DuplicateException(
                    f"Category with name '{category_in.name}' already exists"
                )

        return category_repository.update(db, db_category, category_in)

    def delete_category(self, db: Session, category_id: int) -> None:
        """
        Deletes a category.
        Ensures the category is empty of products.
        """
        db_category = self.get_category_by_id(db, category_id)

        # Check for products associated with this category.
        # Since Products are implemented in Module 3, this is stubbed for now.
        has_associated_products = False  # Stubbed placeholder

        if has_associated_products:
            raise ValidationException(
                "Cannot delete category that contains associated products"
            )

        category_repository.delete(db, category_id)


# Singleton instance
category_service = CategoryService()
