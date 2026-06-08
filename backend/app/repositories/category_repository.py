from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository:
    """
    CRUD repository operations for the Category model.
    Contains zero business logic.
    """

    def get_all(self, db: Session) -> List[Category]:
        """Retrieves all category records."""
        return db.query(Category).all()

    def get_by_id(self, db: Session, category_id: int) -> Optional[Category]:
        """Retrieves a single category by primary key ID."""
        return db.query(Category).filter(Category.id == category_id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Category]:
        """Retrieves a category by unique name (case-insensitive check)."""
        return (
            db.query(Category)
            .filter(Category.name.ilike(name))
            .first()
        )

    def exists_by_name(self, db: Session, name: str) -> bool:
        """Checks if a category with the same name already exists (case-insensitive)."""
        return self.get_by_name(db, name) is not None

    def create(self, db: Session, category_in: CategoryCreate) -> Category:
        """Inserts a new category into the database."""
        db_category = Category(
            name=category_in.name,
            description=category_in.description,
        )
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    def update(
        self, db: Session, db_category: Category, category_in: CategoryUpdate
    ) -> Category:
        """Updates attributes of an existing category."""
        update_data = category_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    def delete(self, db: Session, category_id: int) -> bool:
        """Deletes a category from the database. Returns True if deleted."""
        db_category = self.get_by_id(db, category_id)
        if db_category:
            db.delete(db_category)
            db.commit()
            return True
        return False

    def count(self, db: Session) -> int:
        """Counts the total number of categories."""
        return db.query(Category).count()


# Singleton instance
category_repository = CategoryRepository()
