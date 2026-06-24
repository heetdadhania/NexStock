from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field

from app.models.inventory_transfer import TransferStatus


class TransferItemCreate(BaseModel):
    """Schema for creating a transfer item."""
    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")


class TransferItemOut(BaseModel):
    """Schema for returning transfer item details."""
    id: int
    transfer_id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int

    model_config = ConfigDict(from_attributes=True)


class TransferCreate(BaseModel):
    """Schema for creating a new inventory transfer."""
    source_warehouse_id: int
    destination_warehouse_id: int
    items: List[TransferItemCreate] = Field(..., min_items=1, description="Transfer must contain at least one item")


class TransferOut(BaseModel):
    """Schema for returning detailed transfer information."""
    id: int
    transfer_number: str
    source_warehouse_id: int
    source_warehouse_name: str
    destination_warehouse_id: int
    destination_warehouse_name: str
    status: TransferStatus
    created_by: int
    created_at: datetime
    items: List[TransferItemOut]
    item_count: int

    model_config = ConfigDict(from_attributes=True)
