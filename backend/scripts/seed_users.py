"""
seed_users.py
-------------
Seeds default users (Admin User, Warehouse Manager) in the database.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import hash_password

logger = logging.getLogger(__name__)


def seed_users(db: Session) -> None:
    """
    Seeds default administrative and manager users.
    """
    logger.info("Starting user seeding...")

    # Fetch role records
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    manager_role = db.query(Role).filter(Role.name == "Manager").first()

    if not admin_role or not manager_role:
        raise RuntimeError("Required roles ('Admin', 'Manager') not found in database. Run seed_roles first.")

    users_to_seed = [
        {
            "name": "Admin User",
            "email": "admin@nexstock.com",
            "password": "Admin@123",
            "role_id": admin_role.id,
            "is_active": True,
        },
        {
            "name": "Warehouse Manager",
            "email": "manager@nexstock.com",
            "password": "Manager@123",
            "role_id": manager_role.id,
            "is_active": True,
        }
    ]

    for user_data in users_to_seed:
        email = user_data["email"]
        try:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                hashed = hash_password(user_data["password"])
                user = User(
                    name=user_data["name"],
                    email=email,
                    password_hash=hashed,
                    role_id=user_data["role_id"],
                    is_active=user_data["is_active"]
                )
                db.add(user)
                db.commit()
                logger.info("Seeded user: %s (%s)", user_data["name"], email)
            else:
                logger.info("User with email '%s' already exists, skipping.", email)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed user '%s': %s", email, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()
