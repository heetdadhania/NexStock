from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------------------------
# Password hashing utilities
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash.

    Returns ``True`` if the password matches, ``False`` otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt.

    This function is used throughout the seed scripts and authentication flow.
    """
    return pwd_context.hash(password)


def get_password_hash(password: str) -> str:
    """Alias for hash_password to maintain backward compatibility."""
    return hash_password(password)
    """Alias for hash_password to maintain backward compatibility."""
    return hash_password(password)

# ---------------------------------------------------------------------------
# JWT creation / validation
# ---------------------------------------------------------------------------
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token.

    * ``data`` must contain at least ``sub`` (user id) and ``role``.
    * ``exp`` claim is added automatically based on ``ACCESS_TOKEN_EXPIRE_MINUTES``
      from the settings unless ``expires_delta`` is provided.
    * Returns the encoded JWT string.
    """
    # Validate required claims
    sub = data.get("sub")
    if sub is None:
        raise ValueError("sub claim is required")
    role = data.get("role")
    if role is None:
        raise ValueError("role claim is required")

    # Work on a copy to avoid mutating the caller's dict
    to_encode = data.copy()

    # Determine expiry (UTC)
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add mandatory claims
    to_encode.update({"sub": str(sub), "role": str(role), "exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token.

    On any validation error (expired, malformed, signature mismatch) a ``401``
    ``HTTPException`` with a ``WWW-Authenticate: Bearer`` header is raised.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if not isinstance(payload, dict) or not payload:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

