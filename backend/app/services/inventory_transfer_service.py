import datetime
import random
import string
from typing import List
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.models.inventory_transfer import InventoryTransfer, TransferStatus
from app.repositories.inventory_transfer_repository import inventory_transfer_repository
from app.repositories.inventory_transfer_item_repository import inventory_transfer_item_repository
from app.repositories.warehouse_inventory_repository import warehouse_inventory_repository
from app.schemas.inventory_transfer import TransferCreate
from app.services.warehouse_service import warehouse_service
from app.services.product_service import product_service
from app.services.warehouse_inventory_service import warehouse_inventory_service
from app.services.activity_log_service import log_action


class InventoryTransferService:
    """
    Business logic service for Inventory Transfer operations.
    Enforces transfer rules, unique numbering, state transitions, and inventory updates.
    """

    def generate_transfer_number(self, db: Session) -> str:
        """
        Auto-generates a unique transfer number.
        Format: TRF-YYYYMMDD-XXXX
        """
        date_str = datetime.date.today().strftime("%Y%m%d")
        while True:
            random_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            transfer_number = f"TRF-{date_str}-{random_suffix}"
            if not inventory_transfer_repository.get_by_transfer_number(db, transfer_number):
                return transfer_number

    def get_all_transfers(self, db: Session) -> List[InventoryTransfer]:
        """Retrieves all transfers."""
        return inventory_transfer_repository.get_all(db)

    def get_transfer_by_id(self, db: Session, transfer_id: int) -> InventoryTransfer:
        """
        Retrieves a single transfer by ID.
        Raises NotFoundException if not found.
        """
        db_transfer = inventory_transfer_repository.get_by_id(db, transfer_id)
        if not db_transfer:
            raise NotFoundException(f"Inventory Transfer with ID {transfer_id} not found")
        return db_transfer

    def validate_source_stock(self, db: Session, source_warehouse_id: int, items: list) -> None:
        """Helper to validate that the source warehouse has enough stock for all items."""
        for item in items:
            inv = warehouse_inventory_repository.get_by_warehouse_and_product(
                db, source_warehouse_id, item.product_id
            )
            available = inv.quantity if inv else 0
            if available < item.quantity:
                raise ValidationException(
                    f"Insufficient stock for product ID {item.product_id} in source warehouse. "
                    f"Available: {available}, Required: {item.quantity}"
                )

    def create_transfer(
        self, db: Session, transfer_in: TransferCreate, created_by: int
    ) -> InventoryTransfer:
        """
        Creates a new inventory transfer in requested status.
        Validates warehouses, active products, distinct locations, and source warehouse stock.
        """
        # Validate that source and destination are different
        if transfer_in.source_warehouse_id == transfer_in.destination_warehouse_id:
            raise ValidationException("Source and Destination warehouses must be different")

        # Validate existence of source and destination warehouses
        warehouse_service.get_warehouse_by_id(db, transfer_in.source_warehouse_id)
        warehouse_service.get_warehouse_by_id(db, transfer_in.destination_warehouse_id)

        # Validate that all products exist and are active
        for item in transfer_in.items:
            product = product_service.get_product_by_id(db, item.product_id)
            if not product.is_active:
                raise ValidationException(f"Product with ID {item.product_id} is inactive")

        # Validate source stock levels (do not deduct stock yet)
        self.validate_source_stock(db, transfer_in.source_warehouse_id, transfer_in.items)

        # Generate unique transfer number
        transfer_number = self.generate_transfer_number(db)

        # Create transfer
        db_transfer = inventory_transfer_repository.create(db, transfer_in, transfer_number, created_by)

        # Create items associated with this transfer
        inventory_transfer_item_repository.create_items(db, db_transfer.id, transfer_in.items)

        db.refresh(db_transfer)

        # Log creation (requested)
        log_action(
            db=db,
            user_id=created_by,
            action="requested",
            entity_type="transfer",
            entity_id=db_transfer.id,
            description=f"Transfer {db_transfer.transfer_number} requested",
        )

        return db_transfer

    def approve_transfer(self, db: Session, transfer_id: int, user_id: int) -> InventoryTransfer:
        """
        Approves a requested transfer.
        Allowed transition: requested -> approved.
        """
        db_transfer = self.get_transfer_by_id(db, transfer_id)

        if db_transfer.status != TransferStatus.requested:
            raise ValidationException(
                f"Cannot approve transfer with status '{db_transfer.status}'. "
                "Only requested transfers can be approved."
            )

        updated_transfer = inventory_transfer_repository.update_status(db, db_transfer, TransferStatus.approved)
        log_action(
            db=db,
            user_id=user_id,
            action="approved",
            entity_type="transfer",
            entity_id=updated_transfer.id,
            description=f"Transfer {updated_transfer.transfer_number} approved",
        )
        return updated_transfer

    def ship_transfer(self, db: Session, transfer_id: int) -> InventoryTransfer:
        """
        Transitions status from approved to in_transit.
        Allowed transition: approved -> in_transit.
        """
        db_transfer = self.get_transfer_by_id(db, transfer_id)

        if db_transfer.status != TransferStatus.approved:
            raise ValidationException(
                f"Cannot ship transfer with status '{db_transfer.status}'. "
                "Only approved transfers can be shipped."
            )

        return inventory_transfer_repository.update_status(db, db_transfer, TransferStatus.in_transit)

    def complete_transfer(self, db: Session, transfer_id: int, user_id: int) -> InventoryTransfer:
        """
        Completes an in-transit transfer and updates warehouse stock.
        Allowed transition: in_transit -> completed.
        """
        db_transfer = self.get_transfer_by_id(db, transfer_id)

        if db_transfer.status != TransferStatus.in_transit:
            raise ValidationException(
                f"Cannot complete transfer with status '{db_transfer.status}'. "
                "Only in-transit transfers can be completed."
            )

        # Re-validate source stock levels immediately before completing transfer
        self.validate_source_stock(db, db_transfer.source_warehouse_id, db_transfer.items)

        # Deduct from source and add to destination
        for item in db_transfer.items:
            warehouse_inventory_service.stock_out(
                db,
                warehouse_id=db_transfer.source_warehouse_id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            warehouse_inventory_service.stock_in(
                db,
                warehouse_id=db_transfer.destination_warehouse_id,
                product_id=item.product_id,
                quantity=item.quantity
            )

        updated_transfer = inventory_transfer_repository.update_status(db, db_transfer, TransferStatus.completed)
        log_action(
            db=db,
            user_id=user_id,
            action="completed",
            entity_type="transfer",
            entity_id=updated_transfer.id,
            description=f"Transfer {updated_transfer.transfer_number} completed",
        )
        return updated_transfer

    def cancel_transfer(self, db: Session, transfer_id: int, user_id: int) -> InventoryTransfer:
        """
        Cancels a requested or approved transfer.
        Allowed transitions: requested -> cancelled, approved -> cancelled.
        """
        db_transfer = self.get_transfer_by_id(db, transfer_id)

        if db_transfer.status not in [TransferStatus.requested, TransferStatus.approved]:
            raise ValidationException(
                f"Cannot cancel transfer with status '{db_transfer.status}'. "
                "Only requested or approved transfers can be cancelled."
            )

        updated_transfer = inventory_transfer_repository.update_status(db, db_transfer, TransferStatus.cancelled)
        log_action(
            db=db,
            user_id=user_id,
            action="cancelled",
            entity_type="transfer",
            entity_id=updated_transfer.id,
            description=f"Transfer {updated_transfer.transfer_number} cancelled",
        )
        return updated_transfer


inventory_transfer_service = InventoryTransferService()
