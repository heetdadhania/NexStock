from datetime import date, datetime, time
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.stock_movement import MovementType, StockMovement


class StockMovementRepository:
    """
    CRUD repository operations for the StockMovement model.
    Contains zero business logic.
    """

    def create(
        self,
        db: Session,
        product_id: int,
        movement_type: MovementType,
        quantity: int,
        created_by: int,
        remarks: Optional[str] = None,
    ) -> StockMovement:
        """Inserts a new stock movement record."""
        db_movement = StockMovement(
            product_id=product_id,
            movement_type=movement_type,
            quantity=quantity,
            created_by=created_by,
            remarks=remarks,
        )
        db.add(db_movement)
        db.commit()
        db.refresh(db_movement)
        return db_movement

    def get_all(
        self,
        db: Session,
        product_id: Optional[int] = None,
        movement_type: Optional[MovementType] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[StockMovement]:
        """
        Retrieves all stock movements matching filters.
        Eagerly loads associated product attributes.
        """
        query = db.query(StockMovement).options(joinedload(StockMovement.product))

        if product_id is not None:
            query = query.filter(StockMovement.product_id == product_id)

        if movement_type is not None:
            query = query.filter(StockMovement.movement_type == movement_type)

        if from_date is not None:
            from_datetime = datetime.combine(from_date, time.min)
            query = query.filter(StockMovement.created_at >= from_datetime)

        if to_date is not None:
            to_datetime = datetime.combine(to_date, time.max)
            query = query.filter(StockMovement.created_at <= to_datetime)

        # Return ordered by newest first
        return query.order_by(StockMovement.created_at.desc()).all()

    def get_by_product(self, db: Session, product_id: int) -> List[StockMovement]:
        """Retrieves stock movements for a specific product ID."""
        return (
            db.query(StockMovement)
            .options(joinedload(StockMovement.product))
            .filter(StockMovement.product_id == product_id)
            .order_by(StockMovement.created_at.desc())
            .all()
        )

    def get_recent(self, db: Session, limit: int = 10) -> List[StockMovement]:
        """
        Retrieves the last N stock movements, ordered by newest first.
        Eagerly loads the associated Product record.
        """
        return (
            db.query(StockMovement)
            .options(joinedload(StockMovement.product))
            .order_by(StockMovement.created_at.desc())
            .limit(limit)
            .all()
        )


# Singleton instance
stock_movement_repository = StockMovementRepository()
