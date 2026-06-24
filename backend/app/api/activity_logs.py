from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.models.user import User
from app.schemas.activity_log import ActivityLogOut
from app.repositories.activity_log_repository import activity_log_repository

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("", response_model=dict)
def get_activity_logs(
    entity_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Retrieves activity logs based on filter criteria.
    Protected: Requires valid JWT.
    """
    logs = activity_log_repository.get_all(
        db=db,
        user_id=user_id,
        entity_type=entity_type,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
    )
    serialized_data = [ActivityLogOut.model_validate(log) for log in logs]
    return success_response(
        data=serialized_data, message="Activity logs retrieved successfully"
    )
