"""
seed_suppliers.py
-----------------
Seeds default suppliers with rating and contact information into the database.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.supplier import Supplier

logger = logging.getLogger(__name__)


def seed_suppliers(db: Session) -> None:
    """
    Seeds default suppliers.
    """
    logger.info("Starting supplier seeding...")

    suppliers_to_seed = [
        {
            "supplier_code": "SUP-001",
            "supplier_name": "Tech Distributors Pvt Ltd",
            "contact_person": "Nikhil Agarwal",
            "email": "tech.distributors@gmail.com",
            "phone": "+91-98765-43210",
            "address": "412-B, Nehru Place Market, New Delhi - 110019",
            "rating": 4.8,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-002",
            "supplier_name": "Global IT Supplies",
            "contact_person": "Meera Nair",
            "email": "global.it@supplies.in",
            "phone": "+91-98654-32109",
            "address": "27, Electronic City Phase 1, Bangalore - 560100",
            "rating": 4.5,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-003",
            "supplier_name": "Enterprise Hardware Solutions",
            "contact_person": "Vikram Singh",
            "email": "enterprise.hw@solutions.co.in",
            "phone": "+91-97543-21098",
            "address": "Sector 18, Millennium City Centre, Gurugram - 122002",
            "rating": 4.2,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-004",
            "supplier_name": "Smart Office Systems",
            "contact_person": "Anita Desai",
            "email": "smart.office@systems.in",
            "phone": "+91-96432-10987",
            "address": "G-12, Connaught Place, New Delhi - 110001",
            "rating": 4.7,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-005",
            "supplier_name": "Digital Infrastructure Pvt",
            "contact_person": "Rohan Mehta",
            "email": "digital.infra@pvtltd.in",
            "phone": "+91-95321-09876",
            "address": "501, Prahaladnagar Corporate Road, Ahmedabad - 380015",
            "rating": 3.9,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-006",
            "supplier_name": "Prime Industrial Traders",
            "contact_person": "Suresh Yadav",
            "email": "prime.industrial@traders.in",
            "phone": "+91-94210-98765",
            "address": "MIDC Industrial Area, Turbhe, Navi Mumbai - 400705",
            "rating": 4.3,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-007",
            "supplier_name": "National Packaging Co",
            "contact_person": "Geeta Kapoor",
            "email": "national.pkg@company.in",
            "phone": "+91-93109-87654",
            "address": "Plot 89, Vatva GIDC, Ahmedabad - 382445",
            "rating": 4.6,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-008",
            "supplier_name": "SafeGuard Equipment Ltd",
            "contact_person": "Dinesh Rao",
            "email": "safeguard@equipment.co.in",
            "phone": "+91-92098-76543",
            "address": "48, Industrial Layout, Peenya, Bangalore - 560058",
            "rating": 4.1,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-009",
            "supplier_name": "Office Essentials India",
            "contact_person": "Pooja Joshi",
            "email": "office.essentials@india.in",
            "phone": "+91-91987-65432",
            "address": "14, Linking Road, Bandra West, Mumbai - 400050",
            "rating": 3.8,
            "is_active": True,
        },
        {
            "supplier_code": "SUP-010",
            "supplier_name": "RapidStock Solutions",
            "contact_person": "Arjun Pillai",
            "email": "rapidstock@solutions.in",
            "phone": "+91-90876-54321",
            "address": "Tower C, Cybercity, Magarpatta, Pune - 411028",
            "rating": 4.4,
            "is_active": True,
        },
    ]

    for supplier_data in suppliers_to_seed:
        code = supplier_data["supplier_code"]
        email = supplier_data["email"]
        try:
            existing = db.query(Supplier).filter(
                (Supplier.supplier_code == code) | (Supplier.email == email)
            ).first()
            if not existing:
                supplier = Supplier(**supplier_data)
                db.add(supplier)
                db.commit()
                logger.info("Seeded supplier: %s (%s)", supplier_data["supplier_name"], code)
            else:
                logger.info("Supplier with code '%s' or email '%s' already exists, skipping.", code, email)
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed supplier '%s': %s", code, e)
            raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_suppliers(db)
    finally:
        db.close()
