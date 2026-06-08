import enum
from sqlalchemy import Column, DateTime, Enum as SqlEnum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class MovementType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"


class StockMovement(Base):
    """
    SQLAlchemy model representing the stock_movements table.
    Tracks stock transactions (IN / OUT movements).
    """

    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    movement_type = Column(SqlEnum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    remarks = Column(String(255), nullable=True)
    created_by = Column(
        Integer, nullable=False, index=True
    )  # Reference to user ID (no foreign key check until users table is built)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product")

    @property
    def product_name(self) -> str:
        """Helper property to retrieve product name."""
        return self.product.name if self.product else ""

    @property
    def sku(self) -> str:
        """Helper property to retrieve product SKU."""
        return self.product.sku if self.product else ""
