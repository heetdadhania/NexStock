from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.security import create_access_token
from app.db.base import get_db
from app.repositories.user_repository import user_repository
from app.schemas.auth import LoginRequest, UserOut
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=dict)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """
    Logs a user into the platform.
    Verifies credentials and returns a JWT access token.
    """
    user = auth_service.authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Encode JWT access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    # Wrap token and UserOut inside success envelope
    token_response = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user),
    }

    return success_response(data=token_response, message="Login successful")


@router.get("/me", response_model=dict)
def get_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Retrieves profile data of the currently authenticated user session.
    Protected: Requires valid JWT.
    """
    user = user_repository.get_by_id(db, current_user["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )

    return success_response(
        data=UserOut.model_validate(user),
        message="User profile retrieved successfully",
    )
