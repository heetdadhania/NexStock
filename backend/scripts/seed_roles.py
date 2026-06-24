"""
seed_roles.py
-------------
Seeds the database with standard roles (Admin, Manager).
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.role import Role

logger = logging.getLogger(__name__)


def seed_roles(db: Session) -> None:
    """
    Seeds standard application roles.
    """
    logger.info("Starting role seeding...")
    roles_to_seed = ["Admin", "Manager"]

    for name in roles_to_seed:
        try:
            existing = db.query(Role).filter(Role.name == name).first()
            if not existing:
                role = Role(name=name)
                db.add(role)
                db.commit()
                logger.info("Seeded role: %s", name)
            else:
                logger.info("Role '%s' already exists, skipping.", name)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed role '%s': %s", name, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_roles(db)
    finally:
        db.close()
