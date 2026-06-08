import random
from typing import List

from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.product import Product
from app.models.inventory import Inventory


def run() -> None:
    """Seed the inventory table for all products.
    Generates random quantities within the required ranges.
    Ensures at least five products have low stock (current_quantity <= minimum_quantity).
    """
    with SessionLocal() as db:
        try:
            products: List[Product] = db.query(Product).all()
            if not products:
                print("[-] No products found – ensure products are seeded first.")
                return

            # Determine first 5 products for low‑stock scenario
            low_stock_products = set(p.id for p in random.sample(products, min(5, len(products))))

            for product in products:
                # Check if inventory already exists for this product
                existing = db.query(Inventory).filter(Inventory.product_id == product.id).first()
                if existing:
                    print(f"[+] Inventory for product ID {product.id} already exists, skipping.")
                    continue

                # Generate quantities
                if product.id in low_stock_products:
                    # Low stock: current <= minimum
                    minimum_quantity = random.randint(5, 50)
                    current_quantity = random.randint(0, minimum_quantity)  # could be zero
                else:
                    minimum_quantity = random.randint(5, 50)
                    current_quantity = random.randint(minimum_quantity + 1, 500)
                maximum_quantity = random.randint(200, 1000)

                inv = Inventory(
                    product_id=product.id,
                    current_quantity=current_quantity,
                    minimum_quantity=minimum_quantity,
                    maximum_quantity=maximum_quantity,
                )
                db.add(inv)
                print(
                    f"[*] Added inventory for product ID {product.id}: current={current_quantity}, min={minimum_quantity}, max={maximum_quantity}."
                )
            db.commit()
            print("[+] Inventory seeding completed.")
        except Exception as e:
            db.rollback()
            print(f"[-] Error seeding inventory: {e}")
            raise

if __name__ == "__main__":
    run()
