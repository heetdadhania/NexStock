import csv
import io
from datetime import date
from decimal import Decimal
from typing import Any, Dict, Generator, List, Optional
from sqlalchemy.orm import Session, joinedload, subqueryload

from app.models.stock_movement import MovementType
from app.models.purchase_order import PurchaseOrder, PurchaseOrderStatus
from app.models.inventory_transfer import InventoryTransfer, TransferStatus
from app.models.warehouse_inventory import WarehouseInventory
from app.models.supplier import Supplier
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


    # ------------------------------------------------------------------
    # V2 Report Methods
    # ------------------------------------------------------------------

    def get_warehouse_inventory_report(
        self,
        db: Session,
        warehouse_id: Optional[int] = None,
        low_stock_only: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Returns per-warehouse product inventory with low-stock flag.
        Optionally filtered by warehouse_id and/or low_stock_only.
        """
        query = (
            db.query(WarehouseInventory)
            .options(
                joinedload(WarehouseInventory.warehouse),
                joinedload(WarehouseInventory.product),
            )
        )
        if warehouse_id is not None:
            query = query.filter(WarehouseInventory.warehouse_id == warehouse_id)
        records = query.all()

        result = []
        for rec in records:
            is_low = rec.quantity <= rec.minimum_quantity
            if low_stock_only and not is_low:
                continue
            result.append({
                "warehouse_name": rec.warehouse_name,
                "product_name": rec.product_name,
                "sku": rec.product_sku,
                "quantity": rec.quantity,
                "minimum_quantity": rec.minimum_quantity,
                "maximum_quantity": rec.maximum_quantity,
                "is_low_stock": is_low,
            })
        return result

    def get_supplier_report(self, db: Session) -> List[Dict[str, Any]]:
        """
        Returns supplier list with total PO count and total received PO value.
        """
        suppliers = db.query(Supplier).all()
        result = []
        for sup in suppliers:
            pos = (
                db.query(PurchaseOrder)
                .options(subqueryload(PurchaseOrder.items))
                .filter(PurchaseOrder.supplier_id == sup.id)
                .all()
            )
            total_orders = len(pos)
            total_value = sum(
                po.total_value for po in pos if po.status == PurchaseOrderStatus.received
            )
            result.append({
                "supplier_code": sup.supplier_code,
                "supplier_name": sup.supplier_name,
                "email": sup.email,
                "rating": sup.rating,
                "is_active": sup.is_active,
                "total_orders": total_orders,
                "total_value": Decimal(str(total_value)),
            })
        return result

    def get_purchase_order_report(
        self,
        db: Session,
        status: Optional[str] = None,
        supplier_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[Dict[str, Any]]:
        """
        Returns purchase orders with supplier/warehouse names and aggregated values.
        """
        query = (
            db.query(PurchaseOrder)
            .options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.warehouse),
                subqueryload(PurchaseOrder.items),
            )
        )
        if status:
            query = query.filter(PurchaseOrder.status == PurchaseOrderStatus(status))
        if supplier_id:
            query = query.filter(PurchaseOrder.supplier_id == supplier_id)
        if warehouse_id:
            query = query.filter(PurchaseOrder.warehouse_id == warehouse_id)
        if from_date:
            query = query.filter(PurchaseOrder.order_date >= from_date)
        if to_date:
            query = query.filter(PurchaseOrder.order_date <= to_date)

        pos = query.order_by(PurchaseOrder.order_date.desc()).all()
        return [
            {
                "po_number": po.po_number,
                "supplier_name": po.supplier_name,
                "warehouse_name": po.warehouse_name,
                "status": po.status.value,
                "order_date": po.order_date,
                "item_count": po.item_count,
                "total_value": Decimal(str(po.total_value)),
            }
            for po in pos
        ]

    def get_transfer_report(
        self,
        db: Session,
        status: Optional[str] = None,
        source_warehouse_id: Optional[int] = None,
        destination_warehouse_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Returns inventory transfers with warehouse names, status, and item count.
        """
        query = (
            db.query(InventoryTransfer)
            .options(
                joinedload(InventoryTransfer.source_warehouse),
                joinedload(InventoryTransfer.destination_warehouse),
                subqueryload(InventoryTransfer.items),
            )
        )
        if status:
            query = query.filter(InventoryTransfer.status == TransferStatus(status))
        if source_warehouse_id:
            query = query.filter(InventoryTransfer.source_warehouse_id == source_warehouse_id)
        if destination_warehouse_id:
            query = query.filter(InventoryTransfer.destination_warehouse_id == destination_warehouse_id)

        transfers = query.order_by(InventoryTransfer.created_at.desc()).all()
        return [
            {
                "transfer_number": t.transfer_number,
                "source_warehouse": t.source_warehouse_name,
                "destination_warehouse": t.destination_warehouse_name,
                "status": t.status.value,
                "created_at": t.created_at,
                "item_count": t.item_count,
            }
            for t in transfers
        ]

    # ------------------------------------------------------------------
    # V2 CSV Export Generators
    # ------------------------------------------------------------------

    def export_warehouse_inventory_csv(
        self,
        db: Session,
        warehouse_id: Optional[int] = None,
        low_stock_only: bool = False,
    ) -> Generator[str, None, None]:
        """Streams warehouse inventory report as CSV rows."""
        data = self.get_warehouse_inventory_report(db, warehouse_id=warehouse_id, low_stock_only=low_stock_only)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Warehouse", "Product", "SKU", "Quantity", "Min Qty", "Max Qty", "Low Stock"])
        yield output.getvalue()
        output.seek(0); output.truncate(0)
        for row in data:
            writer.writerow([
                row["warehouse_name"], row["product_name"], row["sku"],
                row["quantity"], row["minimum_quantity"], row["maximum_quantity"],
                "Yes" if row["is_low_stock"] else "No",
            ])
            yield output.getvalue()
            output.seek(0); output.truncate(0)

    def export_supplier_csv(self, db: Session) -> Generator[str, None, None]:
        """Streams supplier report as CSV rows."""
        data = self.get_supplier_report(db)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Code", "Name", "Email", "Rating", "Active", "Total Orders", "Total Value ($)"])
        yield output.getvalue()
        output.seek(0); output.truncate(0)
        for row in data:
            writer.writerow([
                row["supplier_code"], row["supplier_name"], row["email"],
                row["rating"] or "", "Yes" if row["is_active"] else "No",
                row["total_orders"], float(row["total_value"]),
            ])
            yield output.getvalue()
            output.seek(0); output.truncate(0)

    def export_purchase_orders_csv(
        self,
        db: Session,
        status: Optional[str] = None,
        supplier_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> Generator[str, None, None]:
        """Streams purchase order report as CSV rows."""
        data = self.get_purchase_order_report(
            db, status=status, supplier_id=supplier_id,
            warehouse_id=warehouse_id, from_date=from_date, to_date=to_date,
        )
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["PO Number", "Supplier", "Warehouse", "Status", "Order Date", "Items", "Total Value ($)"])
        yield output.getvalue()
        output.seek(0); output.truncate(0)
        for row in data:
            writer.writerow([
                row["po_number"], row["supplier_name"], row["warehouse_name"],
                row["status"], row["order_date"].isoformat(),
                row["item_count"], float(row["total_value"]),
            ])
            yield output.getvalue()
            output.seek(0); output.truncate(0)

    def export_transfers_csv(
        self,
        db: Session,
        status: Optional[str] = None,
        source_warehouse_id: Optional[int] = None,
        destination_warehouse_id: Optional[int] = None,
    ) -> Generator[str, None, None]:
        """Streams inventory transfer report as CSV rows."""
        data = self.get_transfer_report(
            db, status=status,
            source_warehouse_id=source_warehouse_id,
            destination_warehouse_id=destination_warehouse_id,
        )
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Transfer #", "Source Warehouse", "Destination Warehouse", "Status", "Created At", "Items"])
        yield output.getvalue()
        output.seek(0); output.truncate(0)
        for row in data:
            writer.writerow([
                row["transfer_number"], row["source_warehouse"], row["destination_warehouse"],
                row["status"], row["created_at"].isoformat(), row["item_count"],
            ])
            yield output.getvalue()
            output.seek(0); output.truncate(0)


# Singleton instance
report_service = ReportService()
