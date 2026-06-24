"""
seed_categories.py
------------------
Seeds default product categories in the database.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.category import Category

logger = logging.getLogger(__name__)


def seed_categories(db: Session) -> None:
    """
    Seeds default product categories.
    """
    logger.info("Starting category seeding...")
    categories_to_seed = [
        "Electronics",
        "Raw Materials",
        "Packaging",
        "Office Supplies",
        "Safety Equipment",
        "Tools & Hardware",
        "Cleaning Supplies",
        "Furniture",
        "Spare Parts",
        "Consumables",
    ]

    for name in categories_to_seed:
        try:
            existing = db.query(Category).filter(Category.name == name).first()
            if not existing:
                category = Category(
                    name=name,
                    description=f"Standard warehouse storage category for {name.lower()}."
                )
                db.add(category)
                db.commit()
                logger.info("Seeded category: %s", name)
            else:
                logger.info("Category '%s' already exists, skipping.", name)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed category '%s': %s", name, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()
