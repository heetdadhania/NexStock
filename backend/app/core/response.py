from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class StandardResponse(BaseModel):
    """Pydantic model representing standard wrapper format."""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None


def success_response(
    data: Any = None, message: str = "Request successful"
) -> Dict[str, Any]:
    """
    Returns a dictionary structured as a successful response.
    """
    return {
        "success": True,
        "data": data,
        "message": message,
    }


def error_response(
    message: str = "An error occurred", data: Any = None
) -> Dict[str, Any]:
    """
    Returns a dictionary structured as an error response.
    """
    return {
        "success": False,
        "data": data,
        "message": message,
    }


def paginated_response(
    data: List[Any],
    total: int,
    page: int = 1,
    message: str = "Request successful",
) -> Dict[str, Any]:
    """
    Returns a dictionary structured as a paginated list response.
    Includes total record count and current page for client-side navigation.
    """
    return {
        "success": True,
        "data": data,
        "total": total,
        "page": page,
        "message": message,
    }

