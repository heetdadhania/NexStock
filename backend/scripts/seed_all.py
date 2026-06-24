"""
seed_all.py
-----------
Master seeding orchestrator for NexStock V2 database tables.
Runs all seeding steps in sequence using a single database transaction context.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from seed_roles import seed_roles
from seed_users import seed_users
from seed_categories import seed_categories
from seed_products import seed_products
from seed_inventory import seed_inventory
from seed_movements import seed_movements
from seed_warehouses import seed_warehouses
from seed_suppliers import seed_suppliers
from seed_purchase_orders import seed_purchase_orders
from seed_transfers import seed_transfers
from seed_activity_logs import seed_activity_logs

logger = logging.getLogger(__name__)


def main() -> None:
    """
    Main orchestrator that runs all database seeding functions in logical order.
    """
    # Configure UTF-8 output encoding for Windows command line compatibility
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    logger.info("Initializing database master seeding process...")
    db: Session = SessionLocal()

    steps = [
        ("Roles Seeded", seed_roles),
        ("Users Seeded", seed_users),
        ("Categories Seeded", seed_categories),
        ("Products Seeded", seed_products),
        ("Inventory Seeded", seed_inventory),
        ("Stock Movements Seeded", seed_movements),
        ("Warehouses Seeded", seed_warehouses),
        ("Suppliers Seeded", seed_suppliers),
        ("Purchase Orders Seeded", seed_purchase_orders),
        ("Transfers Seeded", seed_transfers),
        ("Activity Logs Seeded", seed_activity_logs),
    ]

    try:
        for name, fn in steps:
            try:
                fn(db)
                print(f"[✓] {name}")
            except Exception as e:
                print(f"[✗] {name} Failed: {str(e)}")
                logger.error("Seeding step '%s' failed: %s", name, e, exc_info=True)
                sys.exit(1)

        print("\n✅ NexStock V2 Seeding Complete\n")
    finally:
        db.close()


if __name__ == "__main__":
    # Setup detailed logging for seed_all but print console output using standard print
    logging.basicConfig(
        level=logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    main()
