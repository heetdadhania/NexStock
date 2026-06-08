from typing import Optional
from sqlalchemy.orm import Session, joinedload

from app.models.user import User


class UserRepository:
    """
    CRUD repository operations for the User model.
    Contains zero business logic.
    """

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Retrieves an active user by email.
        Eagerly loads the associated Role model.
        """
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .filter(User.email.ilike(email), User.is_active == True)
            .first()
        )

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """
        Retrieves a user by database ID.
        Eagerly loads the associated Role model.
        """
        return (
            db.query(User)
            .options(joinedload(User.role_rel))
            .filter(User.id == user_id, User.is_active == True)
            .first()
        )

    def create(
        self,
        db: Session,
        name: str,
        email: str,
        password_hash: str,
        role_id: int,
    ) -> User:
        """
        Inserts a new user record into the database.
        """
        db_user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role_id=role_id,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user


# Singleton instance
user_repository = UserRepository()
