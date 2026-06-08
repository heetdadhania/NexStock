from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientStockException
from app.models.stock_movement import MovementType, StockMovement
from app.repositories.inventory_repository import inventory_repository
from app.repositories.stock_movement_repository import stock_movement_repository
from app.schemas.inventory import StockInRequest, StockOutRequest
from app.services.product_service import product_service


class InventoryService:
    """
    Business logic service for Inventory stock-in/stock-out and safety stock evaluations.
    """

    def get_inventory_list(self, db: Session) -> List[Dict[str, Any]]:
        """
        Retrieves active products alongside stock details.
        Maps stock levels to status badges and low stock flags.
        """
        products = product_service.get_all_products(db)
        inventory_items = []

        for p in products:
            is_low = p.current_quantity <= p.minimum_quantity
            item = {
                "id": p.id,
                "product_name": p.name,
                "sku": p.sku,
                "current_quantity": p.current_quantity,
                "minimum_quantity": p.minimum_quantity,
                "maximum_quantity": p.maximum_quantity,
                "is_low_stock": is_low,
                "status": "Low Stock" if is_low else "In Stock",
            }
            inventory_items.append(item)

        return inventory_items

    def get_inventory_detail(self, db: Session, product_id: int) -> Dict[str, Any]:
        """
        Retrieves current stock level and status parameters for a single product.
        """
        p = product_service.get_product_by_id(db, product_id)
        is_low = p.current_quantity <= p.minimum_quantity
        return {
            "id": p.id,
            "product_name": p.name,
            "sku": p.sku,
            "current_quantity": p.current_quantity,
            "minimum_quantity": p.minimum_quantity,
            "maximum_quantity": p.maximum_quantity,
            "is_low_stock": is_low,
            "status": "Low Stock" if is_low else "In Stock",
        }

    def stock_in(
        self, db: Session, request: StockInRequest, created_by: int
    ) -> StockMovement:
        """
        Adds stock to a product's inventory level.
        Creates an 'IN' stock movement record.
        """
        # Validate product exists and is active
        product = product_service.get_product_by_id(db, request.product_id)

        # Update Inventory quantities
        db_inventory = product.inventory
        new_quantity = db_inventory.current_quantity + request.quantity
        inventory_repository.update_quantity(db, product.id, new_quantity)

        # Create Stock Movement record
        movement = stock_movement_repository.create(
            db,
            product_id=product.id,
            movement_type=MovementType.IN,
            quantity=request.quantity,
            created_by=created_by,
            remarks=request.remarks,
        )
        return movement

    def stock_out(
        self, db: Session, request: StockOutRequest, created_by: int
    ) -> StockMovement:
        """
        Removes stock from a product's inventory.
        Validates against negative stock counts and logs an 'OUT' movement.
        """
        # Validate product exists and is active
        product = product_service.get_product_by_id(db, request.product_id)

        # Enforce stock validation constraint
        db_inventory = product.inventory
        if db_inventory.current_quantity < request.quantity:
            raise InsufficientStockException(
                f"Cannot withdraw {request.quantity} units. "
                f"Only {db_inventory.current_quantity} units available in stock."
            )

        # Update Inventory quantities
        new_quantity = db_inventory.current_quantity - request.quantity
        inventory_repository.update_quantity(db, product.id, new_quantity)

        # Create Stock Movement record
        movement = stock_movement_repository.create(
            db,
            product_id=product.id,
            movement_type=MovementType.OUT,
            quantity=request.quantity,
            created_by=created_by,
            remarks=request.remarks,
        )
        return movement


# Singleton instance
inventory_service = InventoryService()
