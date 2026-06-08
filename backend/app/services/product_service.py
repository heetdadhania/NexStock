from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateException, NotFoundException, ValidationException
from app.models.product import Product
from app.repositories.inventory_repository import inventory_repository
from app.repositories.product_repository import product_repository
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.category_service import category_service


class ProductService:
    """
    Business logic layer for Product & Inventory management.
    Coordinates database queries and transactional consistency.
    """

    def get_all_products(
        self, db: Session, category_id: Optional[int] = None
    ) -> List[Product]:
        """Retrieves all active products, optionally filtering by category."""
        return product_repository.get_all(db, category_id)

    def get_product_by_id(self, db: Session, product_id: int) -> Product:
        """
        Retrieves a single active product by ID.
        Raises NotFoundException if missing or inactive.
        """
        db_product = product_repository.get_by_id(db, product_id)
        if not db_product:
            raise NotFoundException(f"Product with ID {product_id} not found")
        return db_product

    def create_product(self, db: Session, product_in: ProductCreate) -> Product:
        """
        Creates a new product and auto-creates its associated inventory record.
        Enforces SKU uniqueness and category validation.
        """
        # Validate unique SKU
        if product_repository.exists_by_sku(db, product_in.sku):
            raise DuplicateException(
                f"Product with SKU '{product_in.sku}' already exists"
            )

        # Validate category existence
        category_service.get_category_by_id(db, product_in.category_id)

        # Create Product
        db_product = product_repository.create(db, product_in)

        # Auto-create Inventory record with quantity = 0
        inventory_repository.create(
            db,
            product_id=db_product.id,
            minimum_quantity=product_in.minimum_quantity,
            maximum_quantity=product_in.maximum_quantity,
        )

        return db_product

    def update_product(
        self, db: Session, product_id: int, product_in: ProductUpdate
    ) -> Product:
        """
        Updates product details and pushes safety limit adjustments to the inventory record.
        """
        db_product = self.get_product_by_id(db, product_id)

        # Validate category if changed
        if product_in.category_id is not None:
            category_service.get_category_by_id(db, product_in.category_id)

        # Validate unique SKU if changed
        if product_in.sku and product_in.sku.upper() != db_product.sku:
            if product_repository.exists_by_sku(db, product_in.sku):
                raise DuplicateException(
                    f"Product with SKU '{product_in.sku}' already exists"
                )

        # Update Product attributes
        db_product = product_repository.update(db, db_product, product_in)

        # Update Inventory limits if provided
        if (
            product_in.minimum_quantity is not None
            or product_in.maximum_quantity is not None
        ):
            db_inventory = db_product.inventory
            new_min = (
                product_in.minimum_quantity
                if product_in.minimum_quantity is not None
                else db_inventory.minimum_quantity
            )
            new_max = (
                product_in.maximum_quantity
                if product_in.maximum_quantity is not None
                else db_inventory.maximum_quantity
            )

            # Enforce range logic
            if new_max < new_min:
                raise ValidationException(
                    "maximum_quantity cannot be less than minimum_quantity"
                )

            inventory_repository.update_limits(
                db,
                db_inventory,
                minimum_quantity=product_in.minimum_quantity,
                maximum_quantity=product_in.maximum_quantity,
            )

        return db_product

    def delete_product(self, db: Session, product_id: int) -> None:
        """Soft deletes a product."""
        # Ensure it exists first
        self.get_product_by_id(db, product_id)
        product_repository.soft_delete(db, product_id)


# Singleton instance
product_service = ProductService()
