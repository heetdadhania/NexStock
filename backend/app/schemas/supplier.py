from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class SupplierBase(BaseModel):
    supplier_name: Optional[str] = Field(None, max_length=200)
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)


class SupplierCreate(SupplierBase):
    supplier_code: str = Field(..., max_length=20)
    supplier_name: str = Field(..., max_length=200)
    email: EmailStr


class SupplierUpdate(SupplierBase):
    supplier_code: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class SupplierOut(BaseModel):
    id: int
    supplier_code: str
    supplier_name: str
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierListOut(SupplierOut):
    purchase_order_count: int
