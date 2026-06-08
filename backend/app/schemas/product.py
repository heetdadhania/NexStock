from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=3, max_length=50, description="SKU identifier")
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    category_id: int
    unit_price: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)


class ProductCreate(ProductBase):
    minimum_quantity: int = Field(0, ge=0)
    maximum_quantity: int = Field(0, ge=0)

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, v: str) -> str:
        """Standardizes SKU to uppercase."""
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_quantities(self) -> "ProductCreate":
        """Ensures maximum quantity is greater than or equal to minimum quantity."""
        if self.maximum_quantity < self.minimum_quantity:
            raise ValueError(
                "maximum_quantity must be greater than or equal to minimum_quantity"
            )
        return self


class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=3, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    category_id: Optional[int] = None
    unit_price: Optional[Decimal] = Field(None, gt=0, max_digits=10, decimal_places=2)
    minimum_quantity: Optional[int] = Field(None, ge=0)
    maximum_quantity: Optional[int] = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, v: Optional[str]) -> Optional[str]:
        """Standardizes SKU to uppercase if provided."""
        if v is not None:
            return v.strip().upper()
        return v

    @model_validator(mode="after")
    def validate_quantities_update(self) -> "ProductUpdate":
        """Ensures maximum quantity is greater than or equal to minimum quantity on update."""
        min_qty = self.minimum_quantity
        max_qty = self.maximum_quantity
        if min_qty is not None and max_qty is not None:
            if max_qty < min_qty:
                raise ValueError(
                    "maximum_quantity must be greater than or equal to minimum_quantity"
                )
        return self


class ProductOut(ProductBase):
    id: int
    category_name: str
    is_active: bool
    current_quantity: int
    minimum_quantity: int
    maximum_quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        # Pydantic v2 configuration
        from_attributes = True
