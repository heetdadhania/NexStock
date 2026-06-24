import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.activity_log_repository import activity_log_repository

logger = logging.getLogger(__name__)


def log_action(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str,
    entity_id: Optional[int],
    description: str,
) -> None:
    """
    Log a user action. This helper must never raise exceptions,
    wrapping the repository call in a try/except block.
    """
    try:
        activity_log_repository.create(
            db=db,
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
        )
    except Exception as e:
        logger.exception("Failed to log action: %s. Error: %s", action, str(e))
