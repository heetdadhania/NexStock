import sys
from typing import List

from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.category import Category


def run() -> None:
    """Seed the categories table with the required 10 categories."""
    categories: List[str] = [
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
    with SessionLocal() as db:
        try:
            for name in categories:
                existing = db.query(Category).filter(Category.name == name).first()
                if existing:
                    print(f"[+] Category '{name}' already exists, skipping.")
                    continue
                cat = Category(name=name, description=f"Category for {name.lower()}.")
                db.add(cat)
                print(f"[*] Adding category '{name}'.")
            db.commit()
            print("[+] Categories seeding completed.")
        except Exception as e:
            db.rollback()
            print(f"[-] Error seeding categories: {e}")
            raise

if __name__ == "__main__":
    run()
