from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class WarehouseInventory(Base):
    """
    SQLAlchemy model representing the warehouse_inventory table.
    """

    __tablename__ = "warehouse_inventory"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(
        Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quantity = Column(Integer, default=0, nullable=False)
    minimum_quantity = Column(Integer, default=0, nullable=False)
    maximum_quantity = Column(Integer, default=0, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    warehouse = relationship("Warehouse", back_populates="inventories")
    product = relationship("Product")

    @property
    def product_name(self) -> str:
        return self.product.name if self.product else ""

    @property
    def product_sku(self) -> str:
        return self.product.sku if self.product else ""

    @property
    def category_name(self) -> str:
        return self.product.category_name if self.product else ""

    @property
    def warehouse_name(self) -> str:
        return self.warehouse.warehouse_name if self.warehouse else ""

    @property
    def warehouse_code(self) -> str:
        return self.warehouse.warehouse_code if self.warehouse else ""

    @property
    def is_low_stock(self) -> bool:
        return self.quantity <= self.minimum_quantity

    __table_args__ = (
        UniqueConstraint("warehouse_id", "product_id", name="uq_warehouse_inventory_warehouse_product"),
    )
