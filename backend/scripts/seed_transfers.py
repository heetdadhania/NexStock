"""
seed_transfers.py
-----------------
Seeds 40 inventory transfers between warehouses.
For COMPLETED transfers, shifts inventory between warehouses.
Guarantees at least 8-10 warehouse_inventory records are low stock after completion.
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
from app.models.role import Role
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.stock_movement import StockMovement
from app.models.warehouse import Warehouse
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.inventory_transfer import InventoryTransfer, InventoryTransferItem, TransferStatus
from app.models.activity_log import ActivityLog
from app.models.warehouse_inventory import WarehouseInventory

logger = logging.getLogger(__name__)


def seed_transfers(db: Session) -> None:
    """
    Seeds inventory transfers and adjusts warehouse inventory.
    """
    logger.info("Starting transfers seeding...")

    # Print existing transfer numbers for debugging
    all_existing_numbers = [t.transfer_number for t in db.query(InventoryTransfer.transfer_number).all()]
    logger.info("Existing transfers in DB: %s", all_existing_numbers)

    # Load reference data
    manager_user = db.query(User).join(Role).filter(Role.name == "Manager").first()
    if not manager_user:
        raise RuntimeError("No Manager user found. Run seed_users first.")

    warehouses = db.query(Warehouse).all()
    products = db.query(Product).filter(Product.is_active == True).all()

    if not warehouses or not products:
        raise RuntimeError("Warehouses and active products must exist. Run previous seeders first.")

    warehouse_map = {w.warehouse_code: w for w in warehouses}

    # Define route pairs
    route_codes = [
        ("WH-AMD-001", "WH-MUM-001"),
        ("WH-MUM-001", "WH-DEL-001"),
        ("WH-DEL-001", "WH-BLR-001"),
        ("WH-BLR-001", "WH-AMD-001"),
        ("WH-MUM-001", "WH-AMD-001"),
    ]

    total_transfers = 40
    statuses = (
        [TransferStatus.requested] * 8
        + [TransferStatus.approved] * 8
        + [TransferStatus.in_transit] * 8
        + [TransferStatus.completed] * 12
        + [TransferStatus.cancelled] * 4
    )

    random.seed(84)

    # Generate 40 chronological dates within the last 90 days
    now = datetime.utcnow()
    transfer_dates = []
    for _ in range(total_transfers):
        days_ago = random.randint(1, 90)
        transfer_dates.append(now - timedelta(days=days_ago, hours=random.randint(0, 23)))

    transfer_dates.sort()

    daily_counters = {}

    for idx, created_at in enumerate(transfer_dates):
        date_str = created_at.strftime("%Y%m%d")
        daily_counters[date_str] = daily_counters.get(date_str, 0) + 1
        transfer_number = f"TRF-{date_str}-{daily_counters[date_str]:04d}"

        # Idempotency check
        existing = db.query(InventoryTransfer).filter(InventoryTransfer.transfer_number == transfer_number).first()
        if existing:
            logger.info("Transfer '%s' already exists, skipping.", transfer_number)
            continue

        # Get route pair
        src_code, dst_code = route_codes[idx % len(route_codes)]
        src_wh = warehouse_map.get(src_code)
        dst_wh = warehouse_map.get(dst_code)

        if not src_wh or not dst_wh:
            logger.warning("Warehouse route %s -> %s not found in DB. Skipping.", src_code, dst_code)
            continue

        status = statuses[idx]

        try:
            transfer = InventoryTransfer(
                transfer_number=transfer_number,
                source_warehouse_id=src_wh.id,
                destination_warehouse_id=dst_wh.id,
                status=status,
                created_by=manager_user.id,
                created_at=created_at
            )
            db.add(transfer)
            db.flush()

            # 1 to 4 transfer items
            selected_products = random.sample(products, random.randint(1, 4))

            for product in selected_products:
                qty = random.randint(5, 50)
                item = InventoryTransferItem(
                    transfer_id=transfer.id,
                    product_id=product.id,
                    quantity=qty
                )
                db.add(item)

                # For COMPLETED status, transfer the stock
                if status == TransferStatus.completed:
                    src_inv = db.query(WarehouseInventory).filter(
                        WarehouseInventory.warehouse_id == src_wh.id,
                        WarehouseInventory.product_id == product.id
                    ).first()

                    # Deduct from source if stock is sufficient
                    if src_inv and src_inv.quantity >= qty:
                        src_inv.quantity -= qty

                        # Add to destination
                        dst_inv = db.query(WarehouseInventory).filter(
                            WarehouseInventory.warehouse_id == dst_wh.id,
                            WarehouseInventory.product_id == product.id
                        ).first()

                        if dst_inv:
                            dst_inv.quantity += qty
                        else:
                            min_qty = random.randint(10, 30)
                            max_qty = random.randint(200, 500)
                            dst_inv = WarehouseInventory(
                                warehouse_id=dst_wh.id,
                                product_id=product.id,
                                quantity=qty,
                                minimum_quantity=min_qty,
                                maximum_quantity=max_qty
                            )
                            db.add(dst_inv)
                    else:
                        logger.info(
                            "Insufficient stock in source warehouse %s for product %s. Skipping item transfer.",
                            src_code,
                            product.sku
                        )

            db.commit()
            logger.info("Seeded transfer %s with status %s", transfer_number, status.value)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed transfer %s: %s", transfer_number, e)
            raise

    # Post-processing: Guarantee at least 8-10 warehouse_inventory records have quantity <= minimum_quantity
    try:
        wh_inventories = db.query(WarehouseInventory).all()
        low_stock_records = [rec for rec in wh_inventories if rec.quantity <= rec.minimum_quantity]
        low_stock_count = len(low_stock_records)

        target_low_stock = 10
        if low_stock_count < target_low_stock:
            needed = target_low_stock - low_stock_count
            non_low_stock = [rec for rec in wh_inventories if rec.quantity > rec.minimum_quantity]

            records_to_adjust = random.sample(non_low_stock, min(needed, len(non_low_stock)))
            for rec in records_to_adjust:
                rec.quantity = random.randint(0, rec.minimum_quantity)
                logger.info(
                    "Adjusted WarehouseInventory ID %d (WH %s, Prod %s) to low stock (Qty: %d <= Min: %d)",
                    rec.id,
                    rec.warehouse.warehouse_code,
                    rec.product.sku,
                    rec.quantity,
                    rec.minimum_quantity
                )
            db.commit()
            logger.info("Adjusted %d warehouse inventory records to guarantee 10 low-stock items.", len(records_to_adjust))
        else:
            logger.info("Already have %d low stock warehouse inventory records, no adjustment needed.", low_stock_count)
    except Exception as e:
        db.rollback()
        logger.error("Failed to adjust warehouse low stock records: %s", e)
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_transfers(db)
    finally:
        db.close()
