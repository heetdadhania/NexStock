from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class WarehouseBase(BaseModel):
    warehouse_name: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    warehouse_code: str = Field(..., max_length=20)
    warehouse_name: str = Field(..., max_length=200)
    city: str
    country: str


class WarehouseUpdate(WarehouseBase):
    warehouse_code: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class WarehouseOut(BaseModel):
    id: int
    warehouse_code: str
    warehouse_name: str
    address: Optional[str] = None
    city: str
    state: Optional[str] = None
    country: str
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WarehouseListOut(WarehouseOut):
    inventory_count: int
