from typing import Any, Dict, List, Optional
import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


class SupplierRepository:
    """
    CRUD repository operations for the Supplier model.
    Contains zero business logic.
    """

    def get_all(self, db: Session) -> List[Dict[str, Any]]:
        """Retrieves all suppliers with their purchase order counts."""
        metadata = sa.MetaData()
        purchase_orders = sa.Table(
            "purchase_orders",
            metadata,
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("supplier_id", sa.Integer),
        )

        results = (
            db.query(
                Supplier,
                sa.func.coalesce(sa.func.count(purchase_orders.c.id), 0).label("purchase_order_count"),
            )
            .outerjoin(purchase_orders, Supplier.id == purchase_orders.c.supplier_id)
            .group_by(Supplier.id)
            .all()
        )

        suppliers_list = []
        for supplier, purchase_order_count in results:
            suppliers_list.append({
                "id": supplier.id,
                "supplier_code": supplier.supplier_code,
                "supplier_name": supplier.supplier_name,
                "contact_person": supplier.contact_person,
                "email": supplier.email,
                "phone": supplier.phone,
                "address": supplier.address,
                "rating": supplier.rating,
                "is_active": supplier.is_active,
                "created_at": supplier.created_at,
                "updated_at": supplier.updated_at,
                "purchase_order_count": int(purchase_order_count),
            })
        return suppliers_list

    def get_by_id(self, db: Session, supplier_id: int) -> Optional[Supplier]:
        """Retrieves a single supplier by ID."""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()

    def get_by_code(self, db: Session, supplier_code: str) -> Optional[Supplier]:
        """Retrieves a supplier by code (case-insensitive)."""
        return (
            db.query(Supplier)
            .filter(Supplier.supplier_code.ilike(supplier_code))
            .first()
        )

    def get_by_email(self, db: Session, email: str) -> Optional[Supplier]:
        """Retrieves a supplier by email (case-insensitive)."""
        return (
            db.query(Supplier)
            .filter(Supplier.email.ilike(email))
            .first()
        )

    def exists_by_code(self, db: Session, supplier_code: str) -> bool:
        """Checks if a supplier with the same code exists (case-insensitive)."""
        return self.get_by_code(db, supplier_code) is not None

    def exists_by_email(self, db: Session, email: str) -> bool:
        """Checks if a supplier with the same email exists (case-insensitive)."""
        return self.get_by_email(db, email) is not None

    def create(self, db: Session, supplier_in: SupplierCreate) -> Supplier:
        """Inserts a new supplier into the database."""
        db_supplier = Supplier(
            supplier_code=supplier_in.supplier_code,
            supplier_name=supplier_in.supplier_name,
            contact_person=supplier_in.contact_person or "",
            email=supplier_in.email,
            phone=supplier_in.phone or "",
            address=supplier_in.address or "",
            rating=supplier_in.rating,
        )
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier

    def update(
        self, db: Session, db_supplier: Supplier, supplier_in: SupplierUpdate
    ) -> Supplier:
        """Updates attributes of an existing supplier."""
        update_data = supplier_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is None and field in ["contact_person", "phone", "address"]:
                value = ""
            setattr(db_supplier, field, value)

        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        return db_supplier


    def count(self, db: Session) -> int:
        """Returns the total number of suppliers."""
        return db.query(Supplier).count()


supplier_repository = SupplierRepository()
