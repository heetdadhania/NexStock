from typing import List
from sqlalchemy.orm import Session, joinedload

from app.models.inventory_transfer import InventoryTransferItem
from app.schemas.inventory_transfer import TransferItemCreate


class InventoryTransferItemRepository:
    """
    CRUD repository operations for the InventoryTransferItem model.
    Contains zero business logic.
    """

    def create_items(
        self,
        db: Session,
        transfer_id: int,
        items_in: List[TransferItemCreate],
    ) -> List[InventoryTransferItem]:
        """Creates multiple inventory transfer items in the database."""
        db_items = []
        for item in items_in:
            db_item = InventoryTransferItem(
                transfer_id=transfer_id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
            db.add(db_item)
            db_items.append(db_item)
        db.commit()
        for item in db_items:
            db.refresh(item)
        return db_items

    def get_by_transfer(self, db: Session, transfer_id: int) -> List[InventoryTransferItem]:
        """Retrieves all items belonging to an inventory transfer, with product info preloaded."""
        return (
            db.query(InventoryTransferItem)
            .options(joinedload(InventoryTransferItem.product))
            .filter(InventoryTransferItem.transfer_id == transfer_id)
            .all()
        )

    def get_by_order(self, db: Session, transfer_id: int) -> List[InventoryTransferItem]:
        """Alias for get_by_transfer to satisfy naming constraints."""
        return self.get_by_transfer(db, transfer_id)


inventory_transfer_item_repository = InventoryTransferItemRepository()
