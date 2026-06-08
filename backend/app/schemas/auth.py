from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .user import UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

    model_config = ConfigDict(from_attributes=True)
