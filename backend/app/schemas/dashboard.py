from datetime import datetime
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_products: int
    total_categories: int
    total_inventory_quantity: int
    low_stock_count: int

    class Config:
        from_attributes = True


class InventoryTrendPoint(BaseModel):
    date: str  # Format: YYYY-MM-DD
    stock_in: int
    stock_out: int

    class Config:
        from_attributes = True


class LowStockItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    current_quantity: int
    minimum_quantity: int

    class Config:
        from_attributes = True


class RecentMovement(BaseModel):
    product_name: str
    type: str  # "IN" or "OUT"
    quantity: int
    date: datetime
    created_by_name: str

    class Config:
        from_attributes = True


class V2DashboardStats(BaseModel):
    total_warehouses: int
    total_suppliers: int
    open_purchase_orders: int
    pending_transfers: int
    total_inventory_quantity: int
    low_stock_count: int

    class Config:
        from_attributes = True


class WarehouseInventoryDistribution(BaseModel):
    warehouse_id: int
    warehouse_name: str
    total_quantity: int

    class Config:
        from_attributes = True


class POStatusSummary(BaseModel):
    status: str
    count: int
    total_value: float

    class Config:
        from_attributes = True


class TransferActivityPoint(BaseModel):
    date: str  # Format: YYYY-MM-DD
    transfers_created: int
    transfers_completed: int

    class Config:
        from_attributes = True
