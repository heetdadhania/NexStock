from datetime import date, timedelta
from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.models.stock_movement import MovementType
from app.repositories.category_repository import category_repository
from app.repositories.inventory_repository import inventory_repository
from app.repositories.product_repository import product_repository
from app.repositories.stock_movement_repository import stock_movement_repository


class DashboardService:
    """
    Business service layer that aggregates data from repositories
    and formats it for dashboard response schemas.
    """

    def get_stats(self, db: Session) -> Dict[str, int]:
        """
        Retrieves active products, categories, total quantity, and low-stock count stats.
        """
        return {
            "total_products": product_repository.count_active(db),
            "total_categories": category_repository.count(db),
            "total_inventory_quantity": inventory_repository.get_total_quantity(db),
            "low_stock_count": inventory_repository.get_low_stock_count(db),
        }

    def get_inventory_trend(self, db: Session, days: int = 30) -> List[Dict[str, Any]]:
        """
        Retrieves stock movements in the last N days, groups them by date,
        and fills in gaps with zero quantities.
        """
        today = date.today()
        start_date = today - timedelta(days=days - 1)

        # Initialize trend map with 0s for all dates in the range
        trend_map: Dict[str, Dict[str, int]] = {}
        for i in range(days):
            date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            trend_map[date_str] = {"stock_in": 0, "stock_out": 0}

        # Fetch movements in range
        movements = stock_movement_repository.get_all(db, from_date=start_date)

        for m in movements:
            m_date_str = m.created_at.date().strftime("%Y-%m-%d")
            if m_date_str in trend_map:
                if m.movement_type == MovementType.IN:
                    trend_map[m_date_str]["stock_in"] += m.quantity
                elif m.movement_type == MovementType.OUT:
                    trend_map[m_date_str]["stock_out"] += m.quantity

        # Format output list sorted chronologically
        return [
            {
                "date": date_str,
                "stock_in": vals["stock_in"],
                "stock_out": vals["stock_out"],
            }
            for date_str, vals in sorted(trend_map.items())
        ]

    def get_low_stock_alerts(self, db: Session) -> List[Dict[str, Any]]:
        """
        Retrieves all active product records currently below safety stock limits.
        """
        products = inventory_repository.get_low_stock_items(db)
        return [
            {
                "product_id": p.id,
                "product_name": p.name,
                "sku": p.sku,
                "current_quantity": p.current_quantity,
                "minimum_quantity": p.minimum_quantity,
            }
            for p in products
        ]

    def get_recent_activity(self, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieves recent movements and formats user creator string.
        """
        movements = stock_movement_repository.get_recent(db, limit=limit)
        return [
            {
                "product_name": m.product_name,
                "type": m.movement_type.value,
                "quantity": m.quantity,
                "date": m.created_at,
                "created_by_name": f"User #{m.created_by}",
            }
            for m in movements
        ]


# Singleton instance
dashboard_service = DashboardService()
