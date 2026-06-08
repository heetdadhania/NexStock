from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class InventoryReportItem(BaseModel):
    product_id: int
    sku: str
    name: str
    category: str
    current_quantity: int
    minimum_quantity: int
    maximum_quantity: int
    unit_price: Decimal
    total_value: Decimal
    status: str

    class Config:
        from_attributes = True


class StockMovementReportItem(BaseModel):
    date: datetime
    product_name: str
    sku: str
    type: str  # "IN" or "OUT"
    quantity: int
    remarks: Optional[str] = None
    created_by: int

    class Config:
        from_attributes = True


class LowStockReportItem(BaseModel):
    product_id: int
    sku: str
    name: str
    category: str
    current_quantity: int
    minimum_quantity: int
    shortage: int

    class Config:
        from_attributes = True
