from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    """
    SQLAlchemy model representing registered platform users.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(
        Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    role_rel = relationship("Role")

    @property
    def role(self) -> str:
        """
        Helper property that returns the role name as a string
        to match Pydantic schema expectations.
        """
        return self.role_rel.name if self.role_rel else ""
