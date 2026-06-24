from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateException, NotFoundException, ValidationException
from app.models.warehouse import Warehouse
from app.repositories.warehouse_repository import warehouse_repository
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate
from app.services.activity_log_service import log_action


class WarehouseService:
    """
    Business logic layer for Warehouse Management.
    Enforces rules on uniqueness and constraints before executing database actions.
    """

    def get_all_warehouses(self, db: Session) -> List[Dict[str, Any]]:
        """Retrieves all warehouse records with their inventory counts."""
        return warehouse_repository.get_all(db)

    def get_warehouse_by_id(self, db: Session, warehouse_id: int) -> Warehouse:
        """
        Retrieves a warehouse by ID.
        Raises NotFoundException if not found.
        """
        db_warehouse = warehouse_repository.get_by_id(db, warehouse_id)
        if not db_warehouse:
            raise NotFoundException(f"Warehouse with ID {warehouse_id} not found")
        return db_warehouse

    def create_warehouse(self, db: Session, warehouse_in: WarehouseCreate, user_id: int) -> Warehouse:
        """
        Creates a new warehouse.
        Ensures warehouse code uniqueness (case-insensitive).
        """
        if warehouse_repository.exists_by_code(db, warehouse_in.warehouse_code):
            raise DuplicateException(
                f"Warehouse with code '{warehouse_in.warehouse_code}' already exists"
            )
        warehouse = warehouse_repository.create(db, warehouse_in)
        log_action(
            db=db,
            user_id=user_id,
            action="created",
            entity_type="warehouse",
            entity_id=warehouse.id,
            description=f"Warehouse {warehouse.warehouse_code} created",
        )
        return warehouse

    def update_warehouse(
        self, db: Session, warehouse_id: int, warehouse_in: WarehouseUpdate, user_id: int
    ) -> Warehouse:
        """
        Updates an existing warehouse.
        Enforces uniqueness check and checks pending transfers before disabling.
        """
        db_warehouse = self.get_warehouse_by_id(db, warehouse_id)

        # Check unique warehouse_code collision
        if (
            warehouse_in.warehouse_code
            and warehouse_in.warehouse_code.lower() != db_warehouse.warehouse_code.lower()
        ):
            if warehouse_repository.exists_by_code(db, warehouse_in.warehouse_code):
                raise DuplicateException(
                    f"Warehouse with code '{warehouse_in.warehouse_code}' already exists"
                )

        # Check pending transfers constraint before disabling
        if warehouse_in.is_active is False and db_warehouse.is_active is True:
            if warehouse_repository.has_pending_transfers(db, warehouse_id):
                raise ValidationException(
                    "Cannot disable warehouse with pending inventory transfers"
                )

        updated_warehouse = warehouse_repository.update(db, db_warehouse, warehouse_in)
        log_action(
            db=db,
            user_id=user_id,
            action="updated",
            entity_type="warehouse",
            entity_id=updated_warehouse.id,
            description=f"Warehouse {updated_warehouse.warehouse_code} updated",
        )
        return updated_warehouse


warehouse_service = WarehouseService()
