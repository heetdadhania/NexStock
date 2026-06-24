from typing import List
from sqlalchemy.orm import Session

from app.core.exceptions import (
    InsufficientStockException,
    NotFoundException,
    ValidationException,
)
from app.models.warehouse_inventory import WarehouseInventory
from app.repositories.warehouse_inventory_repository import warehouse_inventory_repository
from app.schemas.warehouse_inventory import WarehouseInventoryUpdate


class WarehouseInventoryService:
    """
    Business logic service for Warehouse Inventory operations.
    Enforces stock limit checks, bounds check, and handles auto-creation.
    """

    def get_inventory_list(self, db: Session, warehouse_id: int) -> List[WarehouseInventory]:
        """
        Retrieves all inventory items for a specific warehouse.
        Verifies that the warehouse exists first.
        """
        from app.services.warehouse_service import warehouse_service

        # Throws 404 if warehouse does not exist
        warehouse_service.get_warehouse_by_id(db, warehouse_id)
        return warehouse_inventory_repository.get_by_warehouse(db, warehouse_id)

    def get_inventory_detail(
        self, db: Session, warehouse_id: int, product_id: int
    ) -> WarehouseInventory:
        """
        Retrieves a single inventory item details.
        Raises NotFoundException if the inventory record doesn't exist.
        """
        db_inventory = warehouse_inventory_repository.get_by_warehouse_and_product(
            db, warehouse_id, product_id
        )
        if not db_inventory:
            raise NotFoundException(
                f"Inventory record for product {product_id} at warehouse {warehouse_id} not found"
            )
        return db_inventory

    def get_or_create_inventory(
        self, db: Session, warehouse_id: int, product_id: int
    ) -> WarehouseInventory:
        """
        Retrieves an inventory record, or auto-creates it if it does not exist.
        Validates existence of the warehouse and product first.
        """
        db_inventory = warehouse_inventory_repository.get_by_warehouse_and_product(
            db, warehouse_id, product_id
        )
        if not db_inventory:
            from app.services.warehouse_service import warehouse_service
            from app.services.product_service import product_service

            # Ensure both parent models exist, otherwise raise 404
            warehouse_service.get_warehouse_by_id(db, warehouse_id)
            product_service.get_product_by_id(db, product_id)

            db_inventory = warehouse_inventory_repository.create(db, warehouse_id, product_id)
        return db_inventory

    def update_limits(
        self,
        db: Session,
        warehouse_id: int,
        product_id: int,
        limits_in: WarehouseInventoryUpdate,
    ) -> WarehouseInventory:
        """
        Updates safety stock limits (minimum and maximum quantity) for a product in a warehouse.
        Enforces minimum <= maximum validation rules.
        """
        db_inventory = self.get_inventory_detail(db, warehouse_id, product_id)

        min_q = (
            limits_in.minimum_quantity
            if limits_in.minimum_quantity is not None
            else db_inventory.minimum_quantity
        )
        max_q = (
            limits_in.maximum_quantity
            if limits_in.maximum_quantity is not None
            else db_inventory.maximum_quantity
        )

        if min_q < 0 or max_q < 0:
            raise ValidationException("Safety limits cannot be negative")

        if min_q > max_q:
            raise ValidationException("minimum_quantity cannot exceed maximum_quantity")

        return warehouse_inventory_repository.update_limits(
            db, db_inventory, limits_in.minimum_quantity, limits_in.maximum_quantity
        )

    def get_all_low_stock(self, db: Session) -> List[WarehouseInventory]:
        """Retrieves all low-stock inventory records across all warehouses."""
        return warehouse_inventory_repository.get_low_stock_by_warehouse(db, warehouse_id=None)

    def stock_in(
        self, db: Session, warehouse_id: int, product_id: int, quantity: int
    ) -> WarehouseInventory:
        """
        Increases the stock quantity in the warehouse.
        Auto-creates the inventory record if not present.
        """
        if quantity <= 0:
            raise ValidationException("Stock-in quantity must be greater than zero")

        db_inventory = self.get_or_create_inventory(db, warehouse_id, product_id)
        new_qty = db_inventory.quantity + quantity
        warehouse_inventory_repository.update_quantity(db, warehouse_id, product_id, new_qty)
        return db_inventory

    def stock_out(
        self, db: Session, warehouse_id: int, product_id: int, quantity: int
    ) -> WarehouseInventory:
        """
        Decreases the stock quantity in the warehouse.
        Enforces that quantity cannot go below 0.
        Auto-creates the inventory record if not present.
        """
        if quantity <= 0:
            raise ValidationException("Stock-out quantity must be greater than zero")

        db_inventory = self.get_or_create_inventory(db, warehouse_id, product_id)

        if db_inventory.quantity < quantity:
            raise InsufficientStockException(
                f"Cannot withdraw {quantity} units. "
                f"Only {db_inventory.quantity} units available in warehouse inventory."
            )

        new_qty = db_inventory.quantity - quantity
        warehouse_inventory_repository.update_quantity(db, warehouse_id, product_id, new_qty)
        return db_inventory


warehouse_inventory_service = WarehouseInventoryService()
