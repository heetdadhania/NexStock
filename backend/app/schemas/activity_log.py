from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ActivityLogCreate(BaseModel):
    user_id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    description: str


class ActivityLogOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
