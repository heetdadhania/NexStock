"""
seed_activity_logs.py
---------------------
Seeds 300+ activity log entries mapped to realistic entities and timestamps.
Chronologically orders log entries relative to entity creation/update dates.
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
from app.models.activity_log import ActivityLog
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus
from app.models.inventory_transfer import InventoryTransfer, TransferStatus
from app.models.warehouse_inventory import WarehouseInventory
from app.models.user import User

logger = logging.getLogger(__name__)


def seed_activity_logs(db: Session) -> None:
    """
    Seeds activity logs for all modules.
    """
    logger.info("Starting activity logs seeding...")

    # Check idempotency
    existing_count = db.query(ActivityLog).count()
    if existing_count >= 300:
        logger.info("Database already contains %d activity logs, skipping.", existing_count)
        return

    users = db.query(User).all()
    if not users:
        raise RuntimeError("No users found in database. Run seed_users first.")

    # Alternate users
    admin_user = next((u for u in users if u.role_rel.name == "Admin"), users[0])
    manager_role_user = next((u for u in users if u.role_rel.name == "Manager"), users[-1])

    products = db.query(Product).all()
    warehouses = db.query(Warehouse).all()
    suppliers = db.query(Supplier).all()
    purchase_orders = db.query(PurchaseOrder).all()
    transfers = db.query(InventoryTransfer).all()
    warehouse_inventories = db.query(WarehouseInventory).all()

    logs_to_insert = []
    now = datetime.utcnow()

    # User helper to alternate logs
    user_pool = [admin_user.id, manager_role_user.id]

    def add_log(user_idx: int, action: str, entity_type: str, entity_id: int, description: str, created_at: datetime) -> None:
        logs_to_insert.append(
            ActivityLog(
                user_id=user_pool[user_idx % len(user_pool)],
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                description=description,
                created_at=created_at
            )
        )

    # 1. Product logs (30 products * 2 logs = 60 logs)
    for idx, prod in enumerate(products):
        t_created = now - timedelta(days=random.randint(75, 88))
        t_updated = t_created + timedelta(days=random.randint(1, 10))
        add_log(idx, "created", "product", prod.id, f"Product {prod.name} (SKU: {prod.sku}) created", t_created)
        add_log(idx + 1, "updated", "product", prod.id, f"Product {prod.name} updated", t_updated)

    # 2. Warehouse logs (4 warehouses * 2 logs = 8 logs)
    for idx, wh in enumerate(warehouses):
        t_created = now - timedelta(days=random.randint(80, 88))
        t_updated = t_created + timedelta(days=random.randint(1, 10))
        add_log(idx, "created", "warehouse", wh.id, f"Warehouse {wh.warehouse_code} - {wh.warehouse_name} created", t_created)
        add_log(idx + 1, "updated", "warehouse", wh.id, f"Warehouse {wh.warehouse_name} updated", t_updated)

    # 3. Supplier logs (10 suppliers * 2 logs = 20 logs)
    for idx, sup in enumerate(suppliers):
        t_created = now - timedelta(days=random.randint(80, 88))
        t_updated = t_created + timedelta(days=random.randint(1, 10))
        add_log(idx, "created", "supplier", sup.id, f"Supplier {sup.supplier_name} ({sup.supplier_code}) created", t_created)
        add_log(idx + 1, "updated", "supplier", sup.id, f"Supplier {sup.supplier_name} updated", t_updated)

    # 4. Purchase Order logs (25 POs * ~2.5 logs = ~62 logs)
    for idx, po in enumerate(purchase_orders):
        t_created = po.order_date
        add_log(idx, "created", "purchase_order", po.id, f"Purchase Order {po.po_number} created", t_created)

        if po.status in [PurchaseOrderStatus.approved, PurchaseOrderStatus.received]:
            t_approved = t_created + timedelta(days=random.randint(1, 2))
            add_log(idx + 1, "approved", "purchase_order", po.id, f"Purchase Order {po.po_number} approved", t_approved)

            if po.status == PurchaseOrderStatus.received:
                t_received = t_approved + timedelta(days=random.randint(5, 10))
                add_log(idx + 2, "received", "purchase_order", po.id, f"Purchase Order {po.po_number} received — inventory updated", t_received)

        elif po.status == PurchaseOrderStatus.cancelled:
            t_cancelled = t_created + timedelta(days=random.randint(1, 4))
            add_log(idx + 1, "cancelled", "purchase_order", po.id, f"Purchase Order {po.po_number} cancelled", t_cancelled)

    # 5. Inventory Transfer logs (40 transfers * ~3.5 logs = ~140 logs)
    for idx, transfer in enumerate(transfers):
        t_created = transfer.created_at
        add_log(idx, "created", "transfer", transfer.id, f"Transfer {transfer.transfer_number} created", t_created)

        if transfer.status in [TransferStatus.approved, TransferStatus.in_transit, TransferStatus.completed]:
            t_approved = t_created + timedelta(hours=random.randint(2, 12))
            add_log(idx + 1, "approved", "transfer", transfer.id, f"Transfer {transfer.transfer_number} approved", t_approved)

            if transfer.status in [TransferStatus.in_transit, TransferStatus.completed]:
                t_transit = t_approved + timedelta(hours=random.randint(6, 24))
                add_log(idx + 2, "in_transit", "transfer", transfer.id, f"Transfer {transfer.transfer_number} in transit", t_transit)

                if transfer.status == TransferStatus.completed:
                    t_completed = t_transit + timedelta(hours=random.randint(6, 24))
                    add_log(idx + 3, "completed", "transfer", transfer.id, f"Transfer {transfer.transfer_number} completed — inventory updated", t_completed)

        elif transfer.status == TransferStatus.cancelled:
            t_cancelled = t_created + timedelta(hours=random.randint(2, 24))
            add_log(idx + 1, "cancelled", "transfer", transfer.id, f"Transfer {transfer.transfer_number} cancelled", t_cancelled)

    # 6. Warehouse Inventory logs (approx 60 logs)
    for idx, wh_inv in enumerate(warehouse_inventories[:60]):
        t_update = now - timedelta(days=random.randint(1, 30))
        add_log(
            idx,
            "updated",
            "inventory",
            wh_inv.id,
            f"Inventory updated for {wh_inv.product.name} in {wh_inv.warehouse.warehouse_name}",
            t_update
        )

    # Sort all logs chronologically
    logs_to_insert.sort(key=lambda x: x.created_at)

    logger.info("Inserting %d chronologically ordered activity logs...", len(logs_to_insert))

    try:
        db.bulk_save_objects(logs_to_insert)
        db.commit()
        logger.info("Successfully seeded %d activity logs.", len(logs_to_insert))
    except Exception as e:
        db.rollback()
        logger.error("Failed to seed activity logs: %s", e)
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_activity_logs(db)
    finally:
        db.close()
