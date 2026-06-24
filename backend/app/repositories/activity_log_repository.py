from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.activity_log import ActivityLog


class ActivityLogRepository:
    """
    Repository class for CRUD operations on ActivityLog.
    """

    def create(
        self,
        db: Session,
        user_id: int,
        action: str,
        entity_type: str,
        entity_id: Optional[int],
        description: str,
    ) -> ActivityLog:
        """
        Creates a new activity log record.
        """
        db_log = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

    def get_all(
        self,
        db: Session,
        user_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 50,
    ) -> List[ActivityLog]:
        """
        Retrieves all activity logs matching the criteria, sorted by creation date descending.
        """
        query = db.query(ActivityLog).options(joinedload(ActivityLog.user))

        if user_id is not None:
            query = query.filter(ActivityLog.user_id == user_id)
        if entity_type is not None:
            query = query.filter(ActivityLog.entity_type == entity_type)
        if from_date is not None:
            query = query.filter(ActivityLog.created_at >= from_date)
        if to_date is not None:
            query = query.filter(ActivityLog.created_at <= to_date)

        return query.order_by(ActivityLog.created_at.desc()).limit(limit).all()

    def get_by_entity(
        self,
        db: Session,
        entity_type: str,
        entity_id: int,
    ) -> List[ActivityLog]:
        """
        Retrieves activity logs for a specific entity.
        """
        return (
            db.query(ActivityLog)
            .options(joinedload(ActivityLog.user))
            .filter(
                ActivityLog.entity_type == entity_type,
                ActivityLog.entity_id == entity_id,
            )
            .order_by(ActivityLog.created_at.desc())
            .all()
        )

    def get_recent(
        self,
        db: Session,
        limit: int = 50,
    ) -> List[ActivityLog]:
        """
        Retrieves recent activity logs.
        """
        return (
            db.query(ActivityLog)
            .options(joinedload(ActivityLog.user))
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .all()
        )


activity_log_repository = ActivityLogRepository()
