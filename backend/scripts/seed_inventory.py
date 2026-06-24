"""
seed_inventory.py
-----------------
Seeds the global inventory table (V1) for all products.
Ensures at least 5 products have low stock (current_quantity <= minimum_quantity).
"""
import logging
import random
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.product import Product
from app.models.inventory import Inventory

logger = logging.getLogger(__name__)


def seed_inventory(db: Session) -> None:
    """
    Seeds global inventory records.
    """
    logger.info("Starting inventory seeding...")

    products = db.query(Product).all()
    if not products:
        raise RuntimeError("No products found in database. Run seed_products first.")

    # Force low stock for the first 5 items
    low_stock_target = 5
    low_stock_count = 0

    for idx, product in enumerate(products):
        try:
            existing = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if not existing:
                min_qty = random.randint(10, 50)
                max_qty = random.randint(500, 2000)

                if low_stock_count < low_stock_target:
                    # Low stock condition
                    current_qty = random.randint(0, min_qty)
                    low_stock_count += 1
                else:
                    # Normal stock condition
                    current_qty = random.randint(min_qty + 10, 500)

                inventory = Inventory(
                    product_id=product.id,
                    current_quantity=current_qty,
                    minimum_quantity=min_qty,
                    maximum_quantity=max_qty
                )
                db.add(inventory)
                db.commit()
                logger.info(
                    "Seeded inventory for Product %s (ID: %d): Qty=%d, Min=%d, Max=%d",
                    product.sku,
                    product.id,
                    current_qty,
                    min_qty,
                    max_qty
                )
            else:
                logger.info("Inventory record for Product ID %d already exists, skipping.", product.id)
                # If we skipped an existing record, check if it counts as low stock
                if existing.current_quantity <= existing.minimum_quantity:
                    low_stock_count += 1
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed inventory for Product ID %d: %s", product.id, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_inventory(db)
    finally:
        db.close()
