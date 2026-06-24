from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, subqueryload

from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem
from app.schemas.purchase_order import PurchaseOrderCreate


class PurchaseOrderRepository:
    """
    CRUD repository operations for the PurchaseOrder model.
    Contains zero business logic.
    """

    def get_all(self, db: Session) -> List[PurchaseOrder]:
        """Retrieves all purchase orders with relationships eagerly loaded."""
        return (
            db.query(PurchaseOrder)
            .options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.warehouse),
                subqueryload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product),
            )
            .order_by(PurchaseOrder.created_at.desc())
            .all()
        )

    def get_by_id(self, db: Session, order_id: int) -> Optional[PurchaseOrder]:
        """Retrieves a single purchase order by ID with relationships eagerly loaded."""
        return (
            db.query(PurchaseOrder)
            .options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.warehouse),
                subqueryload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product),
            )
            .filter(PurchaseOrder.id == order_id)
            .first()
        )

    def get_by_po_number(self, db: Session, po_number: str) -> Optional[PurchaseOrder]:
        """Retrieves a single purchase order by PO Number."""
        return (
            db.query(PurchaseOrder)
            .filter(PurchaseOrder.po_number == po_number)
            .first()
        )

    def create(
        self,
        db: Session,
        po_in: PurchaseOrderCreate,
        po_number: str,
        created_by: int,
    ) -> PurchaseOrder:
        """Creates a new purchase order in the database (status defaults to draft)."""
        db_po = PurchaseOrder(
            po_number=po_number,
            supplier_id=po_in.supplier_id,
            warehouse_id=po_in.warehouse_id,
            status=PurchaseOrderStatus.draft,
            order_date=po_in.order_date,
            expected_date=po_in.expected_date,
            created_by=created_by,
        )
        db.add(db_po)
        db.commit()
        db.refresh(db_po)
        return db_po

    def update_status(
        self, db: Session, db_po: PurchaseOrder, status: PurchaseOrderStatus
    ) -> PurchaseOrder:
        """Updates the status of an existing purchase order."""
        db_po.status = status
        db.add(db_po)
        db.commit()
        db.refresh(db_po)
        return db_po


    def count_open(self, db: Session) -> int:
        """Returns the count of open purchase orders (draft or approved)."""
        return (
            db.query(PurchaseOrder)
            .filter(PurchaseOrder.status.in_([PurchaseOrderStatus.draft, PurchaseOrderStatus.approved]))
            .count()
        )


purchase_order_repository = PurchaseOrderRepository()
