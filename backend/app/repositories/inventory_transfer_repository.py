from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, subqueryload

from app.models.inventory_transfer import InventoryTransfer, TransferStatus, InventoryTransferItem
from app.schemas.inventory_transfer import TransferCreate


class InventoryTransferRepository:
    """
    CRUD repository operations for the InventoryTransfer model.
    Contains zero business logic.
    """

    def get_all(self, db: Session) -> List[InventoryTransfer]:
        """Retrieves all inventory transfers with relations eagerly loaded."""
        return (
            db.query(InventoryTransfer)
            .options(
                joinedload(InventoryTransfer.source_warehouse),
                joinedload(InventoryTransfer.destination_warehouse),
                subqueryload(InventoryTransfer.items).joinedload(InventoryTransferItem.product),
            )
            .order_by(InventoryTransfer.created_at.desc())
            .all()
        )

    def get_by_id(self, db: Session, transfer_id: int) -> Optional[InventoryTransfer]:
        """Retrieves a single inventory transfer by ID with relations eagerly loaded."""
        return (
            db.query(InventoryTransfer)
            .options(
                joinedload(InventoryTransfer.source_warehouse),
                joinedload(InventoryTransfer.destination_warehouse),
                subqueryload(InventoryTransfer.items).joinedload(InventoryTransferItem.product),
            )
            .filter(InventoryTransfer.id == transfer_id)
            .first()
        )

    def get_by_transfer_number(self, db: Session, transfer_number: str) -> Optional[InventoryTransfer]:
        """Retrieves a single inventory transfer by its unique transfer number."""
        return (
            db.query(InventoryTransfer)
            .filter(InventoryTransfer.transfer_number == transfer_number)
            .first()
        )

    def create(
        self,
        db: Session,
        transfer_in: TransferCreate,
        transfer_number: str,
        created_by: int,
    ) -> InventoryTransfer:
        """Creates a new inventory transfer record in requested status."""
        db_transfer = InventoryTransfer(
            transfer_number=transfer_number,
            source_warehouse_id=transfer_in.source_warehouse_id,
            destination_warehouse_id=transfer_in.destination_warehouse_id,
            status=TransferStatus.requested,
            created_by=created_by,
        )
        db.add(db_transfer)
        db.commit()
        db.refresh(db_transfer)
        return db_transfer

    def update_status(
        self, db: Session, db_transfer: InventoryTransfer, status: TransferStatus
    ) -> InventoryTransfer:
        """Updates the status of an existing inventory transfer."""
        db_transfer.status = status
        db.add(db_transfer)
        db.commit()
        db.refresh(db_transfer)
        return db_transfer


    def count_pending(self, db: Session) -> int:
        """Returns the count of pending inventory transfers (requested, approved, or in_transit)."""
        return (
            db.query(InventoryTransfer)
            .filter(InventoryTransfer.status.in_([
                TransferStatus.requested,
                TransferStatus.approved,
                TransferStatus.in_transit,
            ]))
            .count()
        )


inventory_transfer_repository = InventoryTransferRepository()
