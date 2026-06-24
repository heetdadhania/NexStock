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


# ---------------------------------------------------------------------------
# V2 Report Schemas
# ---------------------------------------------------------------------------

class WarehouseInventoryReportItem(BaseModel):
    warehouse_name: str
    product_name: str
    sku: str
    quantity: int
    minimum_quantity: int
    maximum_quantity: int
    is_low_stock: bool

    class Config:
        from_attributes = True


class SupplierReportItem(BaseModel):
    supplier_code: str
    supplier_name: str
    email: str
    rating: Optional[float] = None
    is_active: bool
    total_orders: int
    total_value: Decimal

    class Config:
        from_attributes = True


class PurchaseOrderReportItem(BaseModel):
    po_number: str
    supplier_name: str
    warehouse_name: str
    status: str
    order_date: datetime
    item_count: int
    total_value: Decimal

    class Config:
        from_attributes = True


class TransferReportItem(BaseModel):
    transfer_number: str
    source_warehouse: str
    destination_warehouse: str
    status: str
    created_at: datetime
    item_count: int

    class Config:
        from_attributes = True

