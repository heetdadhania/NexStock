from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.purchase_order import PurchaseOrderStatus


class PurchaseOrderItemCreate(BaseModel):
    """Schema for creating a purchase order item."""
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")
    unit_price: Decimal = Field(..., gt=0.0, description="Unit price must be greater than zero")


class PurchaseOrderItemOut(BaseModel):
    """Schema for returning purchase order item details."""
    id: int
    purchase_order_id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderCreate(BaseModel):
    """Schema for creating a new purchase order with its items."""
    supplier_id: int
    warehouse_id: int
    order_date: datetime
    expected_date: Optional[datetime] = None
    items: List[PurchaseOrderItemCreate] = Field(..., min_items=1, description="Purchase order must have at least one item")


class PurchaseOrderOut(BaseModel):
    """Schema for returning detailed information about a single purchase order."""
    id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    warehouse_id: int
    warehouse_name: str
    status: PurchaseOrderStatus
    order_date: datetime
    expected_date: Optional[datetime] = None
    created_by: int
    created_at: datetime
    items: List[PurchaseOrderItemOut]
    total_value: float

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderListOut(BaseModel):
    """Schema for listing purchase orders summary."""
    id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    warehouse_id: int
    warehouse_name: str
    status: PurchaseOrderStatus
    order_date: datetime
    expected_date: Optional[datetime] = None
    created_by: int
    created_at: datetime
    item_count: int
    total_value: float

    model_config = ConfigDict(from_attributes=True)
