from typing import List
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal

from app.models.purchase_order import PurchaseOrderItem
from app.schemas.purchase_order import PurchaseOrderItemCreate


class PurchaseOrderItemRepository:
    """
    CRUD repository operations for the PurchaseOrderItem model.
    Contains zero business logic.
    """

    def create_items(
        self,
        db: Session,
        purchase_order_id: int,
        items_in: List[PurchaseOrderItemCreate],
    ) -> List[PurchaseOrderItem]:
        """Creates multiple purchase order items, auto-calculating total_price."""
        db_items = []
        for item in items_in:
            total_price = Decimal(item.quantity) * item.unit_price
            db_item = PurchaseOrderItem(
                purchase_order_id=purchase_order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=total_price,
            )
            db.add(db_item)
            db_items.append(db_item)
        db.commit()
        for item in db_items:
            db.refresh(item)
        return db_items

    def get_by_order(self, db: Session, purchase_order_id: int) -> List[PurchaseOrderItem]:
        """Retrieves all items belonging to a purchase order, with product info preloaded."""
        return (
            db.query(PurchaseOrderItem)
            .options(joinedload(PurchaseOrderItem.product))
            .filter(PurchaseOrderItem.purchase_order_id == purchase_order_id)
            .all()
        )


purchase_order_item_repository = PurchaseOrderItemRepository()
