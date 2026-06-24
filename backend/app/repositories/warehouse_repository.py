from typing import Any, Dict, List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.models.warehouse import Warehouse
from app.models.warehouse_inventory import WarehouseInventory
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate


class WarehouseRepository:
    """
    CRUD repository operations for the Warehouse model.
    Contains zero business logic.
    """

    def get_all(self, db: Session) -> List[Dict[str, Any]]:
        """Retrieves all warehouses with their inventory quantities count."""
        results = (
            db.query(
                Warehouse,
                sa.func.coalesce(sa.func.sum(WarehouseInventory.quantity), 0).label("inventory_count"),
            )
            .outerjoin(WarehouseInventory, Warehouse.id == WarehouseInventory.warehouse_id)
            .group_by(Warehouse.id)
            .all()
        )

        warehouses_list = []
        for warehouse, inventory_count in results:
            warehouses_list.append({
                "id": warehouse.id,
                "warehouse_code": warehouse.warehouse_code,
                "warehouse_name": warehouse.warehouse_name,
                "address": warehouse.address,
                "city": warehouse.city,
                "state": warehouse.state,
                "country": warehouse.country,
                "contact_person": warehouse.contact_person,
                "contact_email": warehouse.contact_email,
                "contact_phone": warehouse.contact_phone,
                "is_active": warehouse.is_active,
                "created_at": warehouse.created_at,
                "updated_at": warehouse.updated_at,
                "inventory_count": int(inventory_count),
            })
        return warehouses_list

    def get_by_id(self, db: Session, warehouse_id: int) -> Optional[Warehouse]:
        """Retrieves a single warehouse by ID."""
        return db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

    def get_by_code(self, db: Session, warehouse_code: str) -> Optional[Warehouse]:
        """Retrieves a warehouse by code (case-insensitive)."""
        return (
            db.query(Warehouse)
            .filter(Warehouse.warehouse_code.ilike(warehouse_code))
            .first()
        )

    def exists_by_code(self, db: Session, warehouse_code: str) -> bool:
        """Checks if a warehouse with the same code exists (case-insensitive)."""
        return self.get_by_code(db, warehouse_code) is not None

    def create(self, db: Session, warehouse_in: WarehouseCreate) -> Warehouse:
        """Inserts a new warehouse into the database."""
        db_warehouse = Warehouse(
            warehouse_code=warehouse_in.warehouse_code,
            warehouse_name=warehouse_in.warehouse_name,
            address=warehouse_in.address or "",
            city=warehouse_in.city,
            state=warehouse_in.state or "",
            country=warehouse_in.country,
            contact_person=warehouse_in.contact_person or "",
            contact_email=warehouse_in.contact_email or "",
            contact_phone=warehouse_in.contact_phone or "",
        )
        db.add(db_warehouse)
        db.commit()
        db.refresh(db_warehouse)
        return db_warehouse

    def update(
        self, db: Session, db_warehouse: Warehouse, warehouse_in: WarehouseUpdate
    ) -> Warehouse:
        """Updates attributes of an existing warehouse."""
        update_data = warehouse_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            # Handle nullable strings matching db constraints
            if value is None and field in [
                "address",
                "state",
                "contact_person",
                "contact_email",
                "contact_phone",
            ]:
                value = ""
            setattr(db_warehouse, field, value)

        db.add(db_warehouse)
        db.commit()
        db.refresh(db_warehouse)
        return db_warehouse

    def has_pending_transfers(self, db: Session, warehouse_id: int) -> bool:
        """Checks if there are any pending transfers involving the warehouse."""
        metadata = sa.MetaData()
        inventory_transfers = sa.Table(
            "inventory_transfers",
            metadata,
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("source_warehouse_id", sa.Integer),
            sa.Column("destination_warehouse_id", sa.Integer),
            sa.Column("status", sa.String),
        )
        query = db.query(inventory_transfers.c.id).filter(
            sa.or_(
                inventory_transfers.c.source_warehouse_id == warehouse_id,
                inventory_transfers.c.destination_warehouse_id == warehouse_id,
            ),
            inventory_transfers.c.status.in_(["requested", "approved", "in_transit"]),
        )
        return db.query(query.exists()).scalar()


    def count(self, db: Session) -> int:
        """Returns the total number of warehouses."""
        return db.query(Warehouse).count()


warehouse_repository = WarehouseRepository()
