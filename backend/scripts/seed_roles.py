import sys, os
# Add the backend directory to sys.path so that "app" can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import sys
from typing import List

from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.role import Role


def run() -> None:
    """Seed the roles table with required roles (Admin, Manager)."""
    roles_to_create: List[str] = ["Admin", "Manager"]
    with SessionLocal() as db:
        try:
            for role_name in roles_to_create:
                existing = db.query(Role).filter(Role.name == role_name).first()
                if existing:
                    print(f"[+] Role '{role_name}' already exists, skipping.")
                    continue
                role = Role(name=role_name)
                db.add(role)
                print(f"[*] Adding role '{role_name}'.")
            db.commit()
            print("[+] Roles seeding completed.")
        except Exception as e:
            db.rollback()
            print(f"[-] Error seeding roles: {e}")
            raise

if __name__ == "__main__":
    run()
