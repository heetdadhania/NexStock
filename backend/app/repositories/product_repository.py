from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    """
    CRUD repository operations for the Product model.
    Encapsulates raw database queries with zero business logic.
    """

    def get_all(
        self, db: Session, category_id: Optional[int] = None
    ) -> List[Product]:
        """
        Retrieves all active products.
        Supports filtering by category_id. Eagerly loads category and inventory.
        """
        query = (
            db.query(Product)
            .options(joinedload(Product.category), joinedload(Product.inventory))
            .filter(Product.is_active == True)
        )
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
        return query.all()

    def get_by_id(self, db: Session, product_id: int) -> Optional[Product]:
        """
        Retrieves an active product by its ID.
        Eagerly loads category and inventory.
        """
        return (
            db.query(Product)
            .options(joinedload(Product.category), joinedload(Product.inventory))
            .filter(Product.id == product_id, Product.is_active == True)
            .first()
        )

    def get_by_sku(self, db: Session, sku: str) -> Optional[Product]:
        """
        Retrieves a product by SKU (case-insensitive, includes inactive products).
        Used for validation checking.
        """
        return (
            db.query(Product)
            .filter(Product.sku.ilike(sku))
            .first()
        )

    def exists_by_sku(self, db: Session, sku: str) -> bool:
        """Checks if a product with the same SKU already exists."""
        return self.get_by_sku(db, sku) is not None

    def create(self, db: Session, product_in: ProductCreate) -> Product:
        """
        Inserts a new product into the database.
        Extracts only product attributes, leaving inventory properties to the service layer.
        """
        db_product = Product(
            sku=product_in.sku,
            name=product_in.name,
            description=product_in.description,
            category_id=product_in.category_id,
            unit_price=product_in.unit_price,
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    def update(
        self, db: Session, db_product: Product, product_in: ProductUpdate
    ) -> Product:
        """
        Updates product attributes.
        Extracts only product attributes, ignoring inventory updates.
        """
        update_data = product_in.model_dump(
            exclude={"minimum_quantity", "maximum_quantity"}, exclude_unset=True
        )
        for field, value in update_data.items():
            setattr(db_product, field, value)

        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product

    def soft_delete(self, db: Session, product_id: int) -> bool:
        """
        Soft deletes a product by marking is_active = False.
        Returns True if successful.
        """
        db_product = (
            db.query(Product)
            .filter(Product.id == product_id, Product.is_active == True)
            .first()
        )
        if db_product:
            db_product.is_active = False
            db.add(db_product)
            db.commit()
            return True
        return False

    def count_active(self, db: Session) -> int:
        """
        Counts the total number of active products in the system.
        """
        return db.query(Product).filter(Product.is_active == True).count()


# Singleton instance
product_repository = ProductRepository()
