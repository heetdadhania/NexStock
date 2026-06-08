from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


class StockMovementOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    movement_type: Literal["IN", "OUT"]
    quantity: int = Field(..., gt=0)
    remarks: Optional[str] = None
    created_by_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
