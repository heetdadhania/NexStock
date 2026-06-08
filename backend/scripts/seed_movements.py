import random
from datetime import datetime, timedelta
from typing import List

from app.db.base import SessionLocal
from app.models.product import Product
from app.models.stock_movement import StockMovement, MovementType
from app.models.inventory import Inventory
from app.models.user import User


def _random_date(days: int = 90) -> datetime:
    """Return a random datetime within the past ``days`` days."""
    return datetime.utcnow() - timedelta(days=random.randint(0, days))


def run() -> None:
    """Seed the stock_movements table with >=150 movements.

    - Randomly selects a product, movement type (IN/OUT), quantity, date and creator.
    - Updates the related Inventory.current_quantity accordingly.
    - Ensures inventory adjustments never go negative.
    """
    MOVEMENT_COUNT = 150
    with SessionLocal() as db:
        try:
            # Load required data
            products: List[Product] = db.query(Product).all()
            if not products:
                print("[-] No products found – seed products first.")
                return

            users: List[User] = db.query(User).filter(User.email.in_(["admin@nexstock.com", "manager@nexstock.com"]))
            users = users.all()
            if len(users) < 2:
                raise RuntimeError("Admin and manager users must exist before seeding movements.")
            user_ids = [u.id for u in users]

            for _ in range(MOVEMENT_COUNT):
                product = random.choice(products)
                movement_type = random.choice([MovementType.IN, MovementType.OUT])
                quantity = random.randint(1, 100)
                remarks = (
                    f"Purchase order #{random.randint(1000, 9999)}"
                    if movement_type == MovementType.IN
                    else f"Dispatch to warehouse {random.choice(['A', 'B', 'C'])}"
                )
                movement = StockMovement(
                    product_id=product.id,
                    movement_type=movement_type,
                    quantity=quantity,
                    remarks=remarks,
                    created_by=random.choice(user_ids),
                    created_at=_random_date(),
                )
                db.add(movement)

                # Update inventory
                inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()
                if not inventory:
                    # Create a default inventory record if missing
                    inventory = Inventory(
                        product_id=product.id,
                        current_quantity=0,
                        minimum_quantity=5,
                        maximum_quantity=500,
                    )
                    db.add(inventory)

                if movement_type == MovementType.IN:
                    inventory.current_quantity += quantity
                else:
                    inventory.current_quantity = max(inventory.current_quantity - quantity, 0)

            db.commit()
            print(f"[+] Seeded {MOVEMENT_COUNT} stock movements successfully.")
        except Exception as e:
            db.rollback()
            print(f"[-] Error seeding stock movements: {e}")
            raise

if __name__ == "__main__":
    run()
