from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.product import Product


class InventoryRepository:
    """
    CRUD repository operations for the Inventory model.
    Contains zero business logic.
    """

    def get_by_product(self, db: Session, product_id: int) -> Optional[Inventory]:
        """Retrieves an inventory record for a specific product."""
        return db.query(Inventory).filter(Inventory.product_id == product_id).first()

    def create(
        self,
        db: Session,
        product_id: int,
        minimum_quantity: int = 0,
        maximum_quantity: int = 0,
    ) -> Inventory:
        """
        Creates a new inventory record with current_quantity = 0.
        """
        db_inventory = Inventory(
            product_id=product_id,
            current_quantity=0,
            minimum_quantity=minimum_quantity,
            maximum_quantity=maximum_quantity,
        )
        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)
        return db_inventory

    def update_quantity(
        self, db: Session, product_id: int, quantity: int
    ) -> Optional[Inventory]:
        """
        Directly sets/updates the current quantity of stock for a product.
        """
        db_inventory = self.get_by_product(db, product_id)
        if db_inventory:
            db_inventory.current_quantity = quantity
            db.add(db_inventory)
            db.commit()
            db.refresh(db_inventory)
        return db_inventory

    def update_limits(
        self,
        db: Session,
        db_inventory: Inventory,
        minimum_quantity: Optional[int] = None,
        maximum_quantity: Optional[int] = None,
    ) -> Inventory:
        """
        Updates min/max safety limits for stock levels.
        """
        if minimum_quantity is not None:
            db_inventory.minimum_quantity = minimum_quantity
        if maximum_quantity is not None:
            db_inventory.maximum_quantity = maximum_quantity

        db.add(db_inventory)
        db.commit()
        db.refresh(db_inventory)
        return db_inventory

    def get_total_quantity(self, db: Session) -> int:
        """
        Calculates the sum of all current_quantity across active products.
        """
        result = (
            db.query(func.sum(Inventory.current_quantity))
            .join(Product, Product.id == Inventory.product_id)
            .filter(Product.is_active == True)
            .scalar()
        )
        return int(result) if result is not None else 0

    def get_low_stock_count(self, db: Session) -> int:
        """
        Counts active products where current stock is at or below the minimum limit.
        """
        return (
            db.query(Inventory)
            .join(Product, Product.id == Inventory.product_id)
            .filter(Product.is_active == True)
            .filter(Inventory.current_quantity <= Inventory.minimum_quantity)
            .count()
        )

    def get_low_stock_items(self, db: Session) -> List[Product]:
        """
        Retrieves all active product records currently at or below safety stock limits.
        """
        return (
            db.query(Product)
            .join(Inventory, Product.id == Inventory.product_id)
            .filter(Product.is_active == True)
            .filter(Inventory.current_quantity <= Inventory.minimum_quantity)
            .all()
        )


# Singleton instance
inventory_repository = InventoryRepository()
