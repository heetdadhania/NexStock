"""
seed_products.py
----------------
Seeds 30 products (3 per category) into the database with unique SKUs.
"""
import logging
import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import SessionLocal
from app.models.category import Category
from app.models.product import Product

logger = logging.getLogger(__name__)


def seed_products(db: Session) -> None:
    """
    Seeds default products.
    """
    logger.info("Starting product seeding...")

    # Load categories from DB
    categories = db.query(Category).all()
    category_map = {cat.name: cat for cat in categories}

    expected_categories = [
        "Electronics",
        "Raw Materials",
        "Packaging",
        "Office Supplies",
        "Safety Equipment",
        "Tools & Hardware",
        "Cleaning Supplies",
        "Furniture",
        "Spare Parts",
        "Consumables",
    ]

    for cat_name in expected_categories:
        if cat_name not in category_map:
            raise RuntimeError(f"Required category '{cat_name}' not found. Run seed_categories first.")

    products_data = {
        "Electronics": [
            ("Dell Latitude Laptop", 75000.00, "High-performance business laptop."),
            ("HP LaserJet Printer", 22000.00, "Monochrome laser printer for high volume printing."),
            ("Cisco Network Switch", 45000.00, "24-port gigabit managed switch.")
        ],
        "Raw Materials": [
            ("Industrial Steel Rods", 15000.00, "Premium grade reinforcement structural steel rods."),
            ("Aluminium Sheets", 12000.00, "High strength alloy aluminium sheet."),
            ("Copper Wire Coils", 35000.00, "Pure electrical grade copper winding wire.")
        ],
        "Packaging": [
            ("Corrugated Boxes (Large)", 85.00, "Heavy-duty 5-ply shipping boxes."),
            ("Bubble Wrap Rolls", 750.00, "Standard cushioning wrap roll, 50 meters."),
            ("Packing Tape Rolls", 120.00, "Strong adhesive brown packaging tape.")
        ],
        "Office Supplies": [
            ("A4 Paper Reams", 350.00, "75gsm premium multipurpose copier paper."),
            ("Whiteboard Markers Set", 250.00, "4-color dry erase whiteboard marker set."),
            ("Stapler Heavy Duty", 650.00, "Desktop stapler with up to 50 sheets capacity.")
        ],
        "Safety Equipment": [
            ("Safety Helmets", 450.00, "IS-certified industrial protective headgear."),
            ("Fire Extinguisher 5kg", 3200.00, "ABC dry powder fire extinguisher."),
            ("High-Vis Safety Vest", 180.00, "Reflective mesh vest for warehouse visibility.")
        ],
        "Tools & Hardware": [
            ("Hand Tool Set", 2400.00, "Multi-purpose chrome vanadium steel hand tool kit."),
            ("Power Drill", 4200.00, "Reversible variable speed hammer power drill."),
            ("Measuring Tape 5m", 150.00, "Retractable measuring tape with lock mechanism.")
        ],
        "Cleaning Supplies": [
            ("Disinfectant Liquid 5L", 850.00, "All-purpose industrial surface floor disinfectant."),
            ("Microfiber Cloth Pack", 300.00, "Ultra soft lint-free microfiber towels (pack of 5)."),
            ("Industrial Floor Mop", 950.00, "Heavy-duty wet mop with telescopic metal handle.")
        ],
        "Furniture": [
            ("Ergonomic Office Chair", 8500.00, "Mesh high-back chair with adjustable armrests."),
            ("Folding Seminar Table", 4500.00, "Portable heavy-duty plastic folding training table."),
            ("Steel Storage Cabinet", 12500.00, "4-shelf secure steel office file cupboard.")
        ],
        "Spare Parts": [
            ("Ball Bearings (Set of 10)", 1200.00, "Chrome steel deep groove double bearings."),
            ("V-Belts (Heavy Duty)", 850.00, "Heat and oil resistant industrial V-belt."),
            ("Hydraulic Seal Kit", 1500.00, "Premium polyurethane hydraulic cylinder seal set.")
        ],
        "Consumables": [
            ("Industrial Gloves", 220.00, "Heavy-duty rubberized protective gloves."),
            ("Plastic Bin Organizers", 350.00, "Stackable plastic storage bins for small parts."),
            ("WD-40 Lubricant Spray", 400.00, "Multi-use rust prevention and lubricant spray.")
        ]
    }

    for cat_name, items in products_data.items():
        category = category_map[cat_name]
        # Clean prefix: first 4 letters of category in uppercase. Strip whitespace/symbols.
        prefix = cat_name.replace(" ", "").replace("&", "")[:4].upper()

        for idx, (name, price, desc) in enumerate(items, start=1):
            sku = f"{prefix}-{idx:03d}"
            try:
                existing = db.query(Product).filter(Product.sku == sku).first()
                if not existing:
                    product = Product(
                        sku=sku,
                        name=name,
                        description=desc,
                        category_id=category.id,
                        unit_price=price,
                        is_active=True
                    )
                    db.add(product)
                    db.commit()
                    logger.info("Seeded product: %s (%s)", name, sku)
                else:
                    logger.info("Product with SKU '%s' already exists, skipping.", sku)
            except Exception as e:
                db.rollback()
                logger.error("Failed to seed product '%s': %s", sku, e)
                raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()
