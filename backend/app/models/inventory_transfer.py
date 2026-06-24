import enum
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class TransferStatus(str, enum.Enum):
    requested = "requested"
    approved = "approved"
    in_transit = "in_transit"
    completed = "completed"
    cancelled = "cancelled"


class InventoryTransfer(Base):
    __tablename__ = "inventory_transfers"

    id = Column(Integer, primary_key=True, index=True)
    transfer_number = Column(String(50), unique=True, nullable=False, index=True)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    destination_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(Enum(TransferStatus, name="transferstatus"), default=TransferStatus.requested, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    destination_warehouse = relationship("Warehouse", foreign_keys=[destination_warehouse_id])
    creator = relationship("User")
    items = relationship("InventoryTransferItem", back_populates="transfer", cascade="all, delete-orphan")

    @property
    def source_warehouse_name(self) -> str:
        return self.source_warehouse.warehouse_name if self.source_warehouse else ""

    @property
    def destination_warehouse_name(self) -> str:
        return self.destination_warehouse.warehouse_name if self.destination_warehouse else ""

    @property
    def item_count(self) -> int:
        return len(self.items)


class InventoryTransferItem(Base):
    __tablename__ = "inventory_transfer_items"

    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("inventory_transfers.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)

    # Relationships
    transfer = relationship("InventoryTransfer", back_populates="items")
    product = relationship("Product")

    @property
    def product_name(self) -> str:
        return self.product.name if self.product else ""

    @property
    def product_sku(self) -> str:
        return self.product.sku if self.product else ""
