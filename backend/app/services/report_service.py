import csv
import io
from datetime import date
from typing import Any, Dict, Generator, List, Optional
from sqlalchemy.orm import Session

from app.models.stock_movement import MovementType
from app.repositories.inventory_repository import inventory_repository
from app.repositories.product_repository import product_repository
from app.repositories.stock_movement_repository import stock_movement_repository


class ReportService:
    """
    Business service layer executing query aggregations for reporting pages
    and streaming formatted CSV attachments.
    """

    def get_inventory_report(
        self, db: Session, category_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Compiles active product inventory levels, safety thresholds, and valuations.
        """
        products = product_repository.get_all(db, category_id=category_id)
        report = []

        for p in products:
            qty = p.current_quantity
            price = p.unit_price
            val = qty * price
            is_low = qty <= p.minimum_quantity

            report.append({
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "category": p.category_name,
                "current_quantity": qty,
                "minimum_quantity": p.minimum_quantity,
                "maximum_quantity": p.maximum_quantity,
                "unit_price": price,
                "total_value": val,
                "status": "Low Stock" if is_low else "In Stock",
            })

        return report

    def get_stock_movements_report(
        self,
        db: Session,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        product_id: Optional[int] = None,
        movement_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetches historical stock transaction logs matching filter bounds.
        """
        m_type = MovementType(movement_type) if movement_type else None
        movements = stock_movement_repository.get_all(
            db,
            product_id=product_id,
            movement_type=m_type,
            from_date=from_date,
            to_date=to_date,
        )

        return [
            {
                "date": m.created_at,
                "product_name": m.product_name,
                "sku": m.sku,
                "type": m.movement_type.value,
                "quantity": m.quantity,
                "remarks": m.remarks,
                "created_by": m.created_by,
            }
            for m in movements
        ]

    def get_low_stock_report(self, db: Session) -> List[Dict[str, Any]]:
        """
        Compiles active items under safety margins and counts quantities shortage.
        """
        products = inventory_repository.get_low_stock_items(db)
        return [
            {
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "category": p.category_name,
                "current_quantity": p.current_quantity,
                "minimum_quantity": p.minimum_quantity,
                "shortage": max(0, p.minimum_quantity - p.current_quantity),
            }
            for p in products
        ]

    def export_inventory_csv(
        self, db: Session, category_id: Optional[int] = None
    ) -> Generator[str, None, None]:
        """
        Streams CSV lines containing general inventory listings and valuations.
        """
        data = self.get_inventory_report(db, category_id=category_id)
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Product ID", "SKU", "Name", "Category",
            "Current Qty", "Min Qty", "Max Qty",
            "Unit Price ($)", "Total Value ($)", "Status"
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in data:
            writer.writerow([
                row["product_id"], row["sku"], row["name"], row["category"],
                row["current_quantity"], row["minimum_quantity"], row["maximum_quantity"],
                float(row["unit_price"]), float(row["total_value"]), row["status"]
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    def export_movements_csv(
        self,
        db: Session,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        product_id: Optional[int] = None,
        movement_type: Optional[str] = None,
    ) -> Generator[str, None, None]:
        """
        Streams CSV lines listing stock adjustment transaction logs.
        """
        data = self.get_stock_movements_report(
            db,
            from_date=from_date,
            to_date=to_date,
            product_id=product_id,
            movement_type=movement_type,
        )
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Date & Time", "Product Name", "SKU",
            "Type", "Quantity", "Remarks", "Created By ID"
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in data:
            writer.writerow([
                row["date"].isoformat(), row["product_name"], row["sku"],
                row["type"], row["quantity"], row["remarks"] or "", row["created_by"]
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    def export_low_stock_csv(self, db: Session) -> Generator[str, None, None]:
        """
        Streams CSV lines documenting products under safety limits and shortages.
        """
        data = self.get_low_stock_report(db)
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Product ID", "SKU", "Product Name",
            "Category", "Current Qty", "Min Qty", "Shortage Amount"
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in data:
            writer.writerow([
                row["product_id"], row["sku"], row["name"],
                row["category"], row["current_quantity"], row["minimum_quantity"],
                row["shortage"]
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)


# Singleton instance
report_service = ReportService()
