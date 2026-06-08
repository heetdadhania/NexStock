from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Inventory(Base):
    """
    SQLAlchemy model representing the inventory table.
    Maintains current, minimum, and maximum stock levels for each product.
    """

    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    current_quantity = Column(Integer, default=0, nullable=False)
    minimum_quantity = Column(Integer, default=0, nullable=False)
    maximum_quantity = Column(Integer, default=0, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    product = relationship("Product", back_populates="inventory")
