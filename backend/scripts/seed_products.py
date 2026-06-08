import random
from typing import List

from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.category import Category
from app.models.product import Product

# Mapping of category name to SKU prefix
SKU_PREFIXES = {
    "Electronics": "ELEC",
    "Raw Materials": "RAW",
    "Packaging": "PACK",
    "Office Supplies": "OFF",
    "Safety Equipment": "SAFE",
    "Tools & Hardware": "TOOL",
    "Cleaning Supplies": "CLEAN",
    "Furniture": "FURN",
    "Spare Parts": "SPAR",
    "Consumables": "CONS",
}


def run() -> None:
    """Seed the products table with 30 products (3 per category).
    Each product gets a unique SKU like 'ELEC-001'.
    """
    with SessionLocal() as db:
        try:
            # Load categories and ensure they exist
            categories: List[Category] = db.query(Category).all()
            cat_by_name = {c.name: c for c in categories}
            for cat_name, prefix in SKU_PREFIXES.items():
                category = cat_by_name.get(cat_name)
                if not category:
                    print(f"[-] Category '{cat_name}' not found, skipping products for it.")
                    continue
                for i in range(1, 4):  # three products per category
                    sku = f"{prefix}-{i:03d}"
                    existing = db.query(Product).filter(Product.sku == sku).first()
                    if existing:
                        print(f"[+] Product with SKU '{sku}' already exists, skipping.")
                        continue
                    name = f"{cat_name} Item {i}"
                    description = f"Standard {cat_name.lower()} product #{i}."
                    unit_price = round(random.uniform(10.0, 500.0), 2)
                    product = Product(
                        sku=sku,
                        name=name,
                        description=description,
                        category_id=category.id,
                        unit_price=unit_price,
                        is_active=True,
                    )
                    db.add(product)
                    print(f"[*] Adding product '{name}' with SKU '{sku}'.")
            db.commit()
            print("[+] Products seeding completed.")
        except Exception as e:
            db.rollback()
            print(f"[-] Error seeding products: {e}")
            raise

if __name__ == "__main__":
    run()
