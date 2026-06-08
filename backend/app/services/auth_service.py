from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.role import Role
from app.models.user import User
from app.repositories.user_repository import user_repository


class AuthService:
    """
    Business logic service for platform user logins and security seeding.
    """

    def authenticate_user(
        self, db: Session, email: str, password: str
    ) -> Optional[User]:
        """
        Authenticates a user against database email and password records.
        Returns the User object on success, otherwise None.
        """
        user = user_repository.get_by_email(db, email)
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user


# Singleton instance
auth_service = AuthService()


def seed_auth_data(db: Session) -> None:
    """
    Seeds database roles and the default Admin user on first run.
    """
    # 1. Seed Roles
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if not admin_role:
        admin_role = Role(name="Admin")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)

    manager_role = db.query(Role).filter(Role.name == "Manager").first()
    if not manager_role:
        manager_role = Role(name="Manager")
        db.add(manager_role)
        db.commit()

    # 2. Seed Default Admin User
    admin_user = db.query(User).filter(User.email == "admin@nexstock.com").first()
    if not admin_user:
        hashed_pwd = get_password_hash("admin123")
        admin_user = User(
            name="System Admin",
            email="admin@nexstock.com",
            password_hash=hashed_pwd,
            role_id=admin_role.id,
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
