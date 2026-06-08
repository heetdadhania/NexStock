from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)


class CategoryOut(CategoryBase):
    id: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        # Pydantic v2 compatible from_attributes configuration
        from_attributes = True
