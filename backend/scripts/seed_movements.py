"""
seed_movements.py
-----------------
Seeds 150+ stock movements chronologically across all 30 products.
Alternates IN and OUT, ensuring no OUT movement drives stock levels below zero.
"""
import logging
import random
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.product import Product
from app.models.user import User
from app.models.stock_movement import StockMovement, MovementType

logger = logging.getLogger(__name__)


def seed_movements(db: Session) -> None:
    """
    Seeds stock movements.
    """
    logger.info("Starting stock movements seeding...")

    # Check idempotency
    existing_count = db.query(StockMovement).count()
    if existing_count >= 150:
        logger.info("Database already contains %d stock movements, skipping.", existing_count)
        return

    products = db.query(Product).all()
    if not products:
        raise RuntimeError("No products found in database. Run seed_products first.")

    users = db.query(User).all()
    if not users:
        raise RuntimeError("No users found in database. Run seed_users first.")

    # Alternate users
    admin_user = next((u for u in users if u.role_rel.name == "Admin"), users[0])
    manager_role_user = next((u for u in users if u.role_rel.name == "Manager"), users[-1])

    remarks_in = [
        "Initial stock provisioning",
        "Purchase order received",
        "Stock adjustment - surplus found",
        "Returned from client",
        "Transfer fulfillment in",
    ]
    remarks_out = [
        "Dispatched to client",
        "Damaged goods write-off",
        "Stock adjustment - shrinkage",
        "Internal project consumption",
        "Transfer fulfillment out",
    ]

    # Generate movements raw data first, then sort chronologically
    raw_movements = []
    now = datetime.utcnow()

    # Track running total during generation to be safe, per product
    # Each product starts at 0 before movements (we will overwrite/initialize)
    running_stock = {p.id: 0 for p in products}

    # Generate about 6 movements per product -> 180 total
    for product in products:
        # First movement is always IN to avoid starting with OUT (which would be 0)
        p_id = product.id
        start_time = now - timedelta(days=88)

        # Generate timestamps
        times = []
        curr_time = start_time
        for _ in range(6):
            curr_time += timedelta(days=random.randint(5, 12), hours=random.randint(0, 12))
            if curr_time >= now:
                curr_time = now - timedelta(hours=1)
            times.append(curr_time)

        # Sort times to be chronological
        times.sort()

        # Alternate IN/OUT
        m_type = MovementType.IN
        for t in times:
            qty = random.randint(10, 100)
            if m_type == MovementType.IN:
                running_stock[p_id] += qty
                remark = random.choice(remarks_in)
                raw_movements.append({
                    "product_id": p_id,
                    "movement_type": m_type,
                    "quantity": qty,
                    "remarks": remark,
                    "created_at": t
                })
                m_type = MovementType.OUT
            else:
                # OUT movement: enforce no negative inventory
                available = running_stock[p_id]
                if available > 0:
                    qty = min(qty, available)
                    running_stock[p_id] -= qty
                    remark = random.choice(remarks_out)
                    raw_movements.append({
                        "product_id": p_id,
                        "movement_type": m_type,
                        "quantity": qty,
                        "remarks": remark,
                        "created_at": t
                    })
                m_type = MovementType.IN

    # Sort all movements chronologically across all products
    raw_movements.sort(key=lambda m: m["created_at"])

    # Now insert chronologically
    logger.info("Inserting %d chronological stock movements...", len(raw_movements))
    for idx, mov in enumerate(raw_movements):
        try:
            # Alternate creator between admin and manager
            created_by = admin_user.id if idx % 2 == 0 else manager_role_user.id
            db_mov = StockMovement(
                product_id=mov["product_id"],
                movement_type=mov["movement_type"],
                quantity=mov["quantity"],
                remarks=mov["remarks"],
                created_by=created_by,
                created_at=mov["created_at"]
            )
            db.add(db_mov)
            # Flush periodically or commit at the end
        except Exception as e:
            db.rollback()
            logger.error("Failed to insert stock movement index %d: %s", idx, e)
            raise

    try:
        db.commit()
        logger.info("Successfully seeded %d stock movements.", len(raw_movements))
    except Exception as e:
        db.rollback()
        logger.error("Failed to commit stock movements: %s", e)
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_movements(db)
    finally:
        db.close()
