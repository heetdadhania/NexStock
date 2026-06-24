class NexStockException(Exception):
    """Base exception class for NexStock backend errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class NotFoundException(NexStockException):
    """Raised when a requested resource is not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class DuplicateException(NexStockException):
    """Raised when a unique constraint is violated (e.g. unique name, SKU)."""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=400)


class ValidationException(NexStockException):
    """Raised when custom business validation rules fail."""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=400)


class InsufficientStockException(NexStockException):
    """Raised when attempting to withdraw more stock than available."""
    def __init__(self, message: str = "Insufficient stock available"):
        super().__init__(message, status_code=400)


# ---------------------------------------------------------------------------
# V2 Exceptions
# ---------------------------------------------------------------------------

class InsufficientWarehouseStockException(NexStockException):
    """Raised when a transfer quantity exceeds available stock in the source warehouse."""
    def __init__(self, message: str = "Insufficient warehouse stock for this transfer"):
        super().__init__(message, status_code=400)


class InvalidStatusTransitionException(NexStockException):
    """Raised when an invalid status transition is attempted on a PO or transfer."""
    def __init__(self, message: str = "Invalid status transition"):
        super().__init__(message, status_code=400)


class SameWarehouseTransferException(NexStockException):
    """Raised when source and destination warehouse are identical on a transfer."""
    def __init__(self, message: str = "Source and destination warehouse must be different"):
        super().__init__(message, status_code=400)

