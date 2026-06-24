from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.warehouse_inventory import WarehouseInventory


class WarehouseInventoryRepository:
    """
    CRUD repository operations for the WarehouseInventory model.
    Contains zero business logic.
    """

    def get_by_warehouse(self, db: Session, warehouse_id: int) -> List[WarehouseInventory]:
        """Retrieves all inventory records for a specific warehouse."""
        return (
            db.query(WarehouseInventory)
            .filter(WarehouseInventory.warehouse_id == warehouse_id)
            .all()
        )

    def get_by_product(self, db: Session, product_id: int) -> List[WarehouseInventory]:
        """Retrieves all warehouse inventory records for a specific product."""
        return (
            db.query(WarehouseInventory)
            .filter(WarehouseInventory.product_id == product_id)
            .all()
        )

    def get_by_warehouse_and_product(
        self, db: Session, warehouse_id: int, product_id: int
    ) -> Optional[WarehouseInventory]:
        """Retrieves an inventory record for a specific warehouse and product combination."""
        return (
            db.query(WarehouseInventory)
            .filter(
                WarehouseInventory.warehouse_id == warehouse_id,
                WarehouseInventory.product_id == product_id,
            )
            .first()
        )

    def create(
        self,
        db: Session,
        warehouse_id: int,
        product_id: int,
        minimum_quantity: int = 0,
        maximum_quantity: int = 0,
    ) -> WarehouseInventory:
        """Creates a new warehouse inventory record with quantity = 0."""
        db_inventory = WarehouseInventory(
            warehouse_id=warehouse_id,
            product_id=product_id,
            quantity=0,
            minimum_quantity=minimum_quantity,
            maximum_quantity=maximum_quantity,
        )
        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)
        return db_inventory

    def update_quantity(
        self, db: Session, warehouse_id: int, product_id: int, quantity: int
    ) -> Optional[WarehouseInventory]:
        """Directly sets/updates the quantity of stock for a product in a warehouse."""
        db_inventory = self.get_by_warehouse_and_product(db, warehouse_id, product_id)
        if db_inventory:
            db_inventory.quantity = quantity
            db.add(db_inventory)
            db.commit()
            db.refresh(db_inventory)
        return db_inventory

    def update_limits(
        self,
        db: Session,
        db_inventory: WarehouseInventory,
        minimum_quantity: Optional[int] = None,
        maximum_quantity: Optional[int] = None,
    ) -> WarehouseInventory:
        """Updates min/max safety limits for stock levels in a warehouse."""
        if minimum_quantity is not None:
            db_inventory.minimum_quantity = minimum_quantity
        if maximum_quantity is not None:
            db_inventory.maximum_quantity = maximum_quantity

        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)
        return db_inventory

    def get_low_stock_by_warehouse(
        self, db: Session, warehouse_id: Optional[int] = None
    ) -> List[WarehouseInventory]:
        """Counts/retrieves active products at or below safety stock limits for a warehouse or all warehouses."""
        query = db.query(WarehouseInventory).filter(
            WarehouseInventory.quantity <= WarehouseInventory.minimum_quantity
        )
        if warehouse_id is not None:
            query = query.filter(WarehouseInventory.warehouse_id == warehouse_id)
        return query.all()


    def get_total_quantity(self, db: Session) -> int:
        """Returns the total sum of all product quantities across all warehouses."""
        from sqlalchemy import func
        result = db.query(func.sum(WarehouseInventory.quantity)).scalar()
        return int(result) if result is not None else 0

    def get_low_stock_count(self, db: Session) -> int:
        """Returns the count of warehouse inventory records running low on stock."""
        return (
            db.query(WarehouseInventory)
            .filter(WarehouseInventory.quantity <= WarehouseInventory.minimum_quantity)
            .count()
        )


warehouse_inventory_repository = WarehouseInventoryRepository()
