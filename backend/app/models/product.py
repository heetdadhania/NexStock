from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Product(Base):
    """
    SQLAlchemy model representing the products table.
    """

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    category_id = Column(
        Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    unit_price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    category = relationship("Category", backref="products")
    inventory = relationship(
        "Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan"
    )

    @property
    def category_name(self) -> str:
        """Helper property to retrieve category name."""
        return self.category.name if self.category else ""

    @property
    def current_quantity(self) -> int:
        """Helper property to retrieve current inventory quantity."""
        return self.inventory.current_quantity if self.inventory else 0

    @property
    def minimum_quantity(self) -> int:
        """Helper property to retrieve minimum inventory limits."""
        return self.inventory.minimum_quantity if self.inventory else 0

    @property
    def maximum_quantity(self) -> int:
        """Helper property to retrieve maximum inventory limits."""
        return self.inventory.maximum_quantity if self.inventory else 0
