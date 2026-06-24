"""
Shared auto-code generator utilities for NexStock V2.

Generates unique, sequential, date-stamped codes for Purchase Orders and
Inventory Transfers. Each function queries the database for existing codes
on the current date and increments the counter, ensuring uniqueness even
under concurrent writes (relies on DB-level unique constraints as the
final guard).
"""
from datetime import datetime
from sqlalchemy.orm import Session


def generate_po_number(db: Session) -> str:
    """
    Generates a unique Purchase Order number in the format PO-YYYYMMDD-XXXX.

    The sequence resets each calendar day. If PO-20250617-0001 already exists,
    the next call returns PO-20250617-0002, etc.
    """
    from app.models.purchase_order import PurchaseOrder

    date_str = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"PO-{date_str}-"

    # Find the highest existing sequence for today
    existing = (
        db.query(PurchaseOrder.po_number)
        .filter(PurchaseOrder.po_number.like(f"{prefix}%"))
        .all()
    )

    next_seq = _next_sequence(existing, prefix)
    return f"{prefix}{next_seq:04d}"


def generate_transfer_number(db: Session) -> str:
    """
    Generates a unique Transfer number in the format TRF-YYYYMMDD-XXXX.

    The sequence resets each calendar day. If TRF-20250617-0001 already exists,
    the next call returns TRF-20250617-0002, etc.
    """
    from app.models.inventory_transfer import InventoryTransfer

    date_str = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"TRF-{date_str}-"

    existing = (
        db.query(InventoryTransfer.transfer_number)
        .filter(InventoryTransfer.transfer_number.like(f"{prefix}%"))
        .all()
    )

    next_seq = _next_sequence(existing, prefix)
    return f"{prefix}{next_seq:04d}"


def _next_sequence(rows: list, prefix: str) -> int:
    """
    Given a list of (code,) tuples and a prefix, extracts the numeric suffix
    from each matching code and returns max + 1, or 1 if none exist.
    """
    max_seq = 0
    for (code,) in rows:
        try:
            suffix = code[len(prefix):]
            seq = int(suffix)
            if seq > max_seq:
                max_seq = seq
        except (ValueError, IndexError):
            continue
    return max_seq + 1
