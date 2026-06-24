"""
seed_warehouses.py
------------------
Seeds default Indian warehouses in the database.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.warehouse import Warehouse

logger = logging.getLogger(__name__)


def seed_warehouses(db: Session) -> None:
    """
    Seeds default operational warehouses.
    """
    logger.info("Starting warehouse seeding...")

    warehouses_to_seed = [
        {
            "warehouse_code": "WH-AMD-001",
            "warehouse_name": "Ahmedabad Central Warehouse",
            "address": "Plot 47, GIDC Industrial Estate, Vatva",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "country": "India",
            "contact_person": "Rajesh Patel",
            "contact_email": "rajesh.patel@nexstock.com",
            "contact_phone": "+91-79-2589-4721",
            "is_active": True,
        },
        {
            "warehouse_code": "WH-MUM-001",
            "warehouse_name": "Mumbai Distribution Center",
            "address": "Unit 12, Bhiwandi Logistics Park, Bhiwandi",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "contact_person": "Priya Sharma",
            "contact_email": "priya.sharma@nexstock.com",
            "contact_phone": "+91-22-6741-3892",
            "is_active": True,
        },
        {
            "warehouse_code": "WH-DEL-001",
            "warehouse_name": "Delhi Regional Warehouse",
            "address": "Sector 63, Noida Industrial Area",
            "city": "Delhi",
            "state": "Delhi",
            "country": "India",
            "contact_person": "Amit Verma",
            "contact_email": "amit.verma@nexstock.com",
            "contact_phone": "+91-11-4521-7863",
            "is_active": True,
        },
        {
            "warehouse_code": "WH-BLR-001",
            "warehouse_name": "Bangalore Operations Hub",
            "address": "Whitefield Industrial Zone, EPIP Area",
            "city": "Bangalore",
            "state": "Karnataka",
            "country": "India",
            "contact_person": "Sunita Reddy",
            "contact_email": "sunita.reddy@nexstock.com",
            "contact_phone": "+91-80-6732-1945",
            "is_active": True,
        },
    ]

    for wh_data in warehouses_to_seed:
        code = wh_data["warehouse_code"]
        try:
            existing = db.query(Warehouse).filter(Warehouse.warehouse_code == code).first()
            if not existing:
                warehouse = Warehouse(**wh_data)
                db.add(warehouse)
                db.commit()
                logger.info("Seeded warehouse: %s (%s)", wh_data["warehouse_name"], code)
            else:
                logger.info("Warehouse with code '%s' already exists, skipping.", code)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed warehouse '%s': %s", code, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_warehouses(db)
    finally:
        db.close()
