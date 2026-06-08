from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator


class StockInRequest(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity to stock in must be > 0")
    remarks: Optional[str] = Field(None, max_length=255)


class StockOutRequest(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity to stock out must be > 0")
    remarks: Optional[str] = Field(None, max_length=255)


class StockMovementOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    movement_type: str
    quantity: int
    remarks: Optional[str] = None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class InventoryOut(BaseModel):
    id: int  # Product ID
    product_id: int
    product_name: str
    sku: str
    current_quantity: int = Field(..., ge=0)
    minimum_quantity: int = Field(..., ge=0)
    maximum_quantity: int = Field(..., ge=0)
    status: str  # "Low Stock" vs "In Stock"
    is_low_stock: bool
    updated_at: datetime

    @model_validator(mode='after')
    def compute_low_stock(self) -> "InventoryOut":
        self.is_low_stock = self.current_quantity <= self.minimum_quantity
        return self

    model_config = ConfigDict(from_attributes=True)
