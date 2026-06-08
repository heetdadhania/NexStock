import random
from typing import List

from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password


def run() -> None:
    """Seed the users table with an admin and a manager user.
    Passwords are hashed using the project's hash_password utility.
    """
    # Ensure required roles exist
    with SessionLocal() as db:
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        manager_role = db.query(Role).filter(Role.name == "Manager").first()
        if not admin_role or not manager_role:
            raise RuntimeError("Required roles not found. Run seed_roles.py first.")

        users_to_create: List[dict] = [
            {
                "name": "Admin User",
                "email": "admin@nexstock.com",
                "password": "Admin@123",
                "role": admin_role,
            },
            {
                "name": "Manager User",
                "email": "manager@nexstock.com",
                "password": "Manager@123",
                "role": manager_role,
            },
        ]

        for u in users_to_create:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                print(f"[+] User {u['email']} already exists, skipping.")
                continue
            hashed = hash_password(u["password"])
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=hashed,
                role_id=u["role"].id,
                is_active=True,
            )
            db.add(user)
            print(f"[*] Adding user {u['email']}.")
        db.commit()
        print("[+] Users seeding completed.")

if __name__ == "__main__":
    run()
