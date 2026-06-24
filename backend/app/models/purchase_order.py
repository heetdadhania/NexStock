import enum
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class PurchaseOrderStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    received = "received"
    cancelled = "cancelled"


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(Enum(PurchaseOrderStatus, name="purchaseorderstatus"), default=PurchaseOrderStatus.draft, nullable=False)
    order_date = Column(DateTime(timezone=True), nullable=False)
    expected_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    supplier = relationship("Supplier")
    warehouse = relationship("Warehouse")
    creator = relationship("User")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

    @property
    def supplier_name(self) -> str:
        return self.supplier.supplier_name if self.supplier else ""

    @property
    def warehouse_name(self) -> str:
        return self.warehouse.warehouse_name if self.warehouse else ""

    @property
    def item_count(self) -> int:
        return len(self.items)

    @property
    def total_value(self) -> float:
        return float(sum(item.total_price for item in self.items))


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

    @property
    def product_name(self) -> str:
        return self.product.name if self.product else ""

    @property
    def product_sku(self) -> str:
        return self.product.sku if self.product else ""

