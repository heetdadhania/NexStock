import datetime
import random
import string
from typing import List
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus
from app.repositories.purchase_order_repository import purchase_order_repository
from app.repositories.purchase_order_item_repository import purchase_order_item_repository
from app.schemas.purchase_order import PurchaseOrderCreate
from app.services.supplier_service import supplier_service
from app.services.warehouse_service import warehouse_service
from app.services.product_service import product_service
from app.services.warehouse_inventory_service import warehouse_inventory_service
from app.services.activity_log_service import log_action


class PurchaseOrderService:
    """
    Business logic service for Purchase Order operations.
    Enforces status transitions, PO number generation, and inventory updates.
    """

    def generate_po_number(self, db: Session) -> str:
        """
        Auto-generates a unique purchase order number.
        Format: PO-YYYYMMDD-XXXX
        """
        date_str = datetime.date.today().strftime("%Y%m%d")
        while True:
            random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            po_number = f"PO-{date_str}-{random_suffix}"
            if not purchase_order_repository.get_by_po_number(db, po_number):
                return po_number

    def get_all_orders(self, db: Session) -> List[PurchaseOrder]:
        """Retrieves all purchase orders."""
        return purchase_order_repository.get_all(db)

    def get_order_by_id(self, db: Session, order_id: int) -> PurchaseOrder:
        """
        Retrieves a single purchase order by ID.
        Raises NotFoundException if not found.
        """
        db_po = purchase_order_repository.get_by_id(db, order_id)
        if not db_po:
            raise NotFoundException(f"Purchase Order with ID {order_id} not found")
        return db_po

    def create_order(
        self, db: Session, po_in: PurchaseOrderCreate, created_by: int
    ) -> PurchaseOrder:
        """
        Creates a new purchase order in draft status with its items.
        Validates that the supplier and warehouse exist, and all products are active.
        """
        # Validate supplier and warehouse
        supplier_service.get_supplier_by_id(db, po_in.supplier_id)
        warehouse_service.get_warehouse_by_id(db, po_in.warehouse_id)

        # Validate that all products exist and are active
        for item in po_in.items:
            product = product_service.get_product_by_id(db, item.product_id)
            if not product.is_active:
                raise ValidationException(f"Product with ID {item.product_id} is inactive")

        # Generate unique PO number
        po_number = self.generate_po_number(db)

        # Create purchase order
        db_po = purchase_order_repository.create(db, po_in, po_number, created_by)

        # Create items associated with this purchase order
        purchase_order_item_repository.create_items(db, db_po.id, po_in.items)

        # Refresh database representation to pull in newly created items
        db.refresh(db_po)

        # Log creation
        log_action(
            db=db,
            user_id=created_by,
            action="created",
            entity_type="purchase_order",
            entity_id=db_po.id,
            description=f"PO {db_po.po_number} created",
        )

        return db_po

    def approve_order(self, db: Session, order_id: int, user_id: int) -> PurchaseOrder:
        """
        Approves a draft purchase order.
        Allowed transition: draft -> approved.
        """
        db_po = self.get_order_by_id(db, order_id)

        if db_po.status != PurchaseOrderStatus.draft:
            raise ValidationException(
                f"Cannot approve purchase order with status '{db_po.status}'. "
                "Only draft orders can be approved."
            )

        updated_po = purchase_order_repository.update_status(db, db_po, PurchaseOrderStatus.approved)
        log_action(
            db=db,
            user_id=user_id,
            action="approved",
            entity_type="purchase_order",
            entity_id=updated_po.id,
            description=f"PO {updated_po.po_number} approved",
        )
        return updated_po

    def receive_order(self, db: Session, order_id: int, user_id: int) -> PurchaseOrder:
        """
        Receives an approved purchase order and updates warehouse inventory levels.
        Allowed transition: approved -> received.
        """
        db_po = self.get_order_by_id(db, order_id)

        if db_po.status != PurchaseOrderStatus.approved:
            raise ValidationException(
                f"Cannot receive purchase order with status '{db_po.status}'. "
                "Only approved orders can be received."
            )

        # For each item, update warehouse_inventory
        for item in db_po.items:
            warehouse_inventory_service.stock_in(
                db,
                warehouse_id=db_po.warehouse_id,
                product_id=item.product_id,
                quantity=item.quantity
            )

        updated_po = purchase_order_repository.update_status(db, db_po, PurchaseOrderStatus.received)
        log_action(
            db=db,
            user_id=user_id,
            action="received",
            entity_type="purchase_order",
            entity_id=updated_po.id,
            description=f"PO {updated_po.po_number} received",
        )
        return updated_po

    def cancel_order(self, db: Session, order_id: int, user_id: int) -> PurchaseOrder:
        """
        Cancels a draft purchase order.
        Allowed transition: draft -> cancelled.
        """
        db_po = self.get_order_by_id(db, order_id)

        if db_po.status != PurchaseOrderStatus.draft:
            raise ValidationException(
                f"Cannot cancel purchase order with status '{db_po.status}'. "
                "Only draft orders can be cancelled."
            )

        updated_po = purchase_order_repository.update_status(db, db_po, PurchaseOrderStatus.cancelled)
        log_action(
            db=db,
            user_id=user_id,
            action="cancelled",
            entity_type="purchase_order",
            entity_id=updated_po.id,
            description=f"PO {updated_po.po_number} cancelled",
        )
        return updated_po


purchase_order_service = PurchaseOrderService()
