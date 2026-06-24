from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class WarehouseInventoryUpdate(BaseModel):
    minimum_quantity: Optional[int] = None
    maximum_quantity: Optional[int] = None


class WarehouseInventoryOut(BaseModel):
    id: int
    warehouse_id: int
    product_id: int
    product_name: str
    product_sku: str
    category_name: str
    warehouse_name: str
    warehouse_code: str
    quantity: int
    minimum_quantity: int
    maximum_quantity: int
    is_low_stock: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
