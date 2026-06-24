"""
seed_purchase_orders.py
-----------------------
Seeds 25 purchase orders with a realistic status distribution across suppliers and warehouses.
Auto-updates warehouse inventory for RECEIVED purchase orders.
"""
import logging
import random
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.warehouse import Warehouse
from app.models.warehouse_inventory import WarehouseInventory
from app.models.user import User
from app.models.role import Role

logger = logging.getLogger(__name__)


def seed_purchase_orders(db: Session) -> None:
    """
    Seeds purchase orders and updates warehouse inventory for received POs.
    """
    logger.info("Starting purchase orders seeding...")

    # Load reference data
    admin_user = db.query(User).join(Role).filter(Role.name == "Admin").first()
    if not admin_user:
        raise RuntimeError("No Admin user found. Run seed_users first.")

    suppliers = db.query(Supplier).all()
    warehouses = db.query(Warehouse).all()
    products = db.query(Product).filter(Product.is_active == True).all()

    if not suppliers or not warehouses or not products:
        raise RuntimeError("Suppliers, warehouses, and active products must exist. Run previous seeders first.")

    # We need 25 POs
    total_pos = 25
    statuses = (
        [PurchaseOrderStatus.draft] * 5
        + [PurchaseOrderStatus.approved] * 8
        + [PurchaseOrderStatus.received] * 10
        + [PurchaseOrderStatus.cancelled] * 2
    )
    # Shuffle or just use them sequentially as we iterate
    random.seed(42)  # For reproducible seeding distribution

    # Generate 25 chronological dates within the last 90 days
    now = datetime.utcnow()
    po_dates = []
    for _ in range(total_pos):
        days_ago = random.randint(1, 90)
        po_dates.append(now - timedelta(days=days_ago, hours=random.randint(0, 23)))

    po_dates.sort()

    daily_counters = {}

    for idx, order_date in enumerate(po_dates):
        date_str = order_date.strftime("%Y%m%d")
        daily_counters[date_str] = daily_counters.get(date_str, 0) + 1
        po_number = f"PO-{date_str}-{daily_counters[date_str]:04d}"

        # Idempotency check
        existing = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first()
        if existing:
            logger.info("Purchase Order '%s' already exists, skipping.", po_number)
            continue

        # Rotate across suppliers and warehouses
        supplier = suppliers[idx % len(suppliers)]
        warehouse = warehouses[idx % len(warehouses)]
        status = statuses[idx]

        # Order creation
        expected_date = order_date + timedelta(days=random.randint(7, 30))

        try:
            po = PurchaseOrder(
                po_number=po_number,
                supplier_id=supplier.id,
                warehouse_id=warehouse.id,
                status=status,
                order_date=order_date,
                expected_date=expected_date,
                created_by=admin_user.id
            )
            db.add(po)
            db.flush()  # Populate po.id

            # Select 2 to 5 random products
            selected_products = random.sample(products, random.randint(2, 5))

            for product in selected_products:
                qty = random.randint(10, 200)
                unit_price = Decimal(str(product.unit_price))
                total_price = unit_price * qty

                item = PurchaseOrderItem(
                    purchase_order_id=po.id,
                    product_id=product.id,
                    quantity=qty,
                    unit_price=unit_price,
                    total_price=total_price
                )
                db.add(item)

                # For RECEIVED status, update warehouse_inventory
                if status == PurchaseOrderStatus.received:
                    wh_inv = db.query(WarehouseInventory).filter(
                        WarehouseInventory.warehouse_id == warehouse.id,
                        WarehouseInventory.product_id == product.id
                    ).first()

                    if wh_inv:
                        wh_inv.quantity += qty
                        logger.info(
                            "Updated WarehouseInventory (WH: %s, Prod: %s): +%d (New Qty: %d)",
                            warehouse.warehouse_code,
                            product.sku,
                            qty,
                            wh_inv.quantity
                        )
                    else:
                        min_qty = random.randint(10, 30)
                        max_qty = random.randint(200, 500)
                        wh_inv = WarehouseInventory(
                            warehouse_id=warehouse.id,
                            product_id=product.id,
                            quantity=qty,
                            minimum_quantity=min_qty,
                            maximum_quantity=max_qty
                        )
                        db.add(wh_inv)
                        logger.info(
                            "Created WarehouseInventory (WH: %s, Prod: %s): Qty=%d, Min=%d, Max=%d",
                            warehouse.warehouse_code,
                            product.sku,
                            qty,
                            min_qty,
                            max_qty
                        )

            db.commit()
            logger.info("Seeded Purchase Order %s with status %s", po_number, status.value)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed Purchase Order %s: %s", po_number, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_purchase_orders(db)
    finally:
        db.close()
