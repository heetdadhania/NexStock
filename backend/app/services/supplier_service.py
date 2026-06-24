from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateException, NotFoundException, ValidationException
from app.models.supplier import Supplier
from app.repositories.supplier_repository import supplier_repository
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from app.services.activity_log_service import log_action


class SupplierService:
    """
    Business logic layer for Supplier Management.
    Enforces rules on uniqueness and bounds check.
    """

    def get_all_suppliers(self, db: Session) -> List[Dict[str, Any]]:
        """Retrieves all suppliers with their PO counts."""
        return supplier_repository.get_all(db)

    def get_supplier_by_id(self, db: Session, supplier_id: int) -> Supplier:
        """
        Retrieves a supplier by ID.
        Raises NotFoundException if not found.
        """
        db_supplier = supplier_repository.get_by_id(db, supplier_id)
        if not db_supplier:
            raise NotFoundException(f"Supplier with ID {supplier_id} not found")
        return db_supplier

    def create_supplier(self, db: Session, supplier_in: SupplierCreate, user_id: int) -> Supplier:
        """
        Creates a new supplier.
        Ensures code uniqueness and email uniqueness (case-insensitive).
        """
        if supplier_repository.exists_by_code(db, supplier_in.supplier_code):
            raise DuplicateException(
                f"Supplier with code '{supplier_in.supplier_code}' already exists"
            )

        if supplier_repository.exists_by_email(db, supplier_in.email):
            raise DuplicateException(
                f"Supplier with email '{supplier_in.email}' already exists"
            )

        if supplier_in.rating is not None and (supplier_in.rating < 0.0 or supplier_in.rating > 5.0):
            raise ValidationException("Rating must be between 0.0 and 5.0")

        supplier = supplier_repository.create(db, supplier_in)
        log_action(
            db=db,
            user_id=user_id,
            action="created",
            entity_type="supplier",
            entity_id=supplier.id,
            description=f"Supplier {supplier.supplier_code} created",
        )
        return supplier

    def update_supplier(
        self, db: Session, supplier_id: int, supplier_in: SupplierUpdate, user_id: int
    ) -> Supplier:
        """
        Updates an existing supplier.
        Checks for ID, code, and email unique violations.
        """
        db_supplier = self.get_supplier_by_id(db, supplier_id)

        # Check unique supplier_code collision
        if (
            supplier_in.supplier_code
            and supplier_in.supplier_code.lower() != db_supplier.supplier_code.lower()
        ):
            if supplier_repository.exists_by_code(db, supplier_in.supplier_code):
                raise DuplicateException(
                    f"Supplier with code '{supplier_in.supplier_code}' already exists"
                )

        # Check unique email collision
        if (
            supplier_in.email
            and supplier_in.email.lower() != db_supplier.email.lower()
        ):
            if supplier_repository.exists_by_email(db, supplier_in.email):
                raise DuplicateException(
                    f"Supplier with email '{supplier_in.email}' already exists"
                )

        if supplier_in.rating is not None and (supplier_in.rating < 0.0 or supplier_in.rating > 5.0):
            raise ValidationException("Rating must be between 0.0 and 5.0")

        updated_supplier = supplier_repository.update(db, db_supplier, supplier_in)
        log_action(
            db=db,
            user_id=user_id,
            action="updated",
            entity_type="supplier",
            entity_id=updated_supplier.id,
            description=f"Supplier {updated_supplier.supplier_code} updated",
        )
        return updated_supplier


supplier_service = SupplierService()
