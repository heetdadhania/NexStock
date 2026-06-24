"""v2 add new tables

Revision ID: v2_add_new_tables
Revises: d1a2b3c4d5e6
Create Date: 2026-06-17 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'v2_add_new_tables'
down_revision: Union[str, None] = 'd1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create warehouses table
    op.create_table(
        'warehouses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('warehouse_code', sa.String(length=50), nullable=False),
        sa.Column('warehouse_name', sa.String(length=100), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False),
        sa.Column('contact_person', sa.String(length=100), nullable=False),
        sa.Column('contact_email', sa.String(length=100), nullable=False),
        sa.Column('contact_phone', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_warehouses_id'), 'warehouses', ['id'], unique=False)
    op.create_index(op.f('ix_warehouses_warehouse_code'), 'warehouses', ['warehouse_code'], unique=True)

    # 2. Create suppliers table
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('supplier_code', sa.String(length=50), nullable=False),
        sa.Column('supplier_name', sa.String(length=100), nullable=False),
        sa.Column('contact_person', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_id'), 'suppliers', ['id'], unique=False)
    op.create_index(op.f('ix_suppliers_supplier_code'), 'suppliers', ['supplier_code'], unique=True)
    op.create_index(op.f('ix_suppliers_email'), 'suppliers', ['email'], unique=True)

    # 3. Create warehouse_inventory table
    op.create_table(
        'warehouse_inventory',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), server_default='0', nullable=False),
        sa.Column('minimum_quantity', sa.Integer(), server_default='0', nullable=False),
        sa.Column('maximum_quantity', sa.Integer(), server_default='0', nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('warehouse_id', 'product_id', name='uq_warehouse_inventory_warehouse_product')
    )
    op.create_index(op.f('ix_warehouse_inventory_id'), 'warehouse_inventory', ['id'], unique=False)
    op.create_index(op.f('ix_warehouse_inventory_warehouse_id'), 'warehouse_inventory', ['warehouse_id'], unique=False)
    op.create_index(op.f('ix_warehouse_inventory_product_id'), 'warehouse_inventory', ['product_id'], unique=False)

    # Declare Enums
    purchase_order_status = sa.Enum('draft', 'approved', 'received', 'cancelled', name='purchaseorderstatus')
    transfer_status = sa.Enum('requested', 'approved', 'in_transit', 'completed', 'cancelled', name='transferstatus')

    # 4. Create purchase_orders table
    op.create_table(
        'purchase_orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('po_number', sa.String(length=50), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=False),
        sa.Column('warehouse_id', sa.Integer(), nullable=False),
        sa.Column('status', purchase_order_status, nullable=False),
        sa.Column('order_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expected_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_orders_id'), 'purchase_orders', ['id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_po_number'), 'purchase_orders', ['po_number'], unique=True)
    op.create_index(op.f('ix_purchase_orders_supplier_id'), 'purchase_orders', ['supplier_id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_warehouse_id'), 'purchase_orders', ['warehouse_id'], unique=False)
    op.create_index(op.f('ix_purchase_orders_created_by'), 'purchase_orders', ['created_by'], unique=False)

    # 5. Create purchase_order_items table
    op.create_table(
        'purchase_order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('purchase_order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['purchase_order_id'], ['purchase_orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_order_items_id'), 'purchase_order_items', ['id'], unique=False)
    op.create_index(op.f('ix_purchase_order_items_purchase_order_id'), 'purchase_order_items', ['purchase_order_id'], unique=False)
    op.create_index(op.f('ix_purchase_order_items_product_id'), 'purchase_order_items', ['product_id'], unique=False)

    # 6. Create inventory_transfers table
    op.create_table(
        'inventory_transfers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transfer_number', sa.String(length=50), nullable=False),
        sa.Column('source_warehouse_id', sa.Integer(), nullable=False),
        sa.Column('destination_warehouse_id', sa.Integer(), nullable=False),
        sa.Column('status', transfer_status, nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['source_warehouse_id'], ['warehouses.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['destination_warehouse_id'], ['warehouses.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_transfers_id'), 'inventory_transfers', ['id'], unique=False)
    op.create_index(op.f('ix_inventory_transfers_transfer_number'), 'inventory_transfers', ['transfer_number'], unique=True)
    op.create_index(op.f('ix_inventory_transfers_source_warehouse_id'), 'inventory_transfers', ['source_warehouse_id'], unique=False)
    op.create_index(op.f('ix_inventory_transfers_destination_warehouse_id'), 'inventory_transfers', ['destination_warehouse_id'], unique=False)
    op.create_index(op.f('ix_inventory_transfers_created_by'), 'inventory_transfers', ['created_by'], unique=False)

    # 7. Create inventory_transfer_items table
    op.create_table(
        'inventory_transfer_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('transfer_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['transfer_id'], ['inventory_transfers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inventory_transfer_items_id'), 'inventory_transfer_items', ['id'], unique=False)
    op.create_index(op.f('ix_inventory_transfer_items_transfer_id'), 'inventory_transfer_items', ['transfer_id'], unique=False)
    op.create_index(op.f('ix_inventory_transfer_items_product_id'), 'inventory_transfer_items', ['product_id'], unique=False)

    # 8. Create activity_logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_activity_logs_id'), 'activity_logs', ['id'], unique=False)
    op.create_index(op.f('ix_activity_logs_user_id'), 'activity_logs', ['user_id'], unique=False)


def downgrade() -> None:
    # 8. Drop activity_logs table
    op.drop_index(op.f('ix_activity_logs_user_id'), table_name='activity_logs')
    op.drop_index(op.f('ix_activity_logs_id'), table_name='activity_logs')
    op.drop_table('activity_logs')

    # 7. Drop inventory_transfer_items table
    op.drop_index(op.f('ix_inventory_transfer_items_product_id'), table_name='inventory_transfer_items')
    op.drop_index(op.f('ix_inventory_transfer_items_transfer_id'), table_name='inventory_transfer_items')
    op.drop_index(op.f('ix_inventory_transfer_items_id'), table_name='inventory_transfer_items')
    op.drop_table('inventory_transfer_items')

    # 6. Drop inventory_transfers table
    op.drop_index(op.f('ix_inventory_transfers_created_by'), table_name='inventory_transfers')
    op.drop_index(op.f('ix_inventory_transfers_destination_warehouse_id'), table_name='inventory_transfers')
    op.drop_index(op.f('ix_inventory_transfers_source_warehouse_id'), table_name='inventory_transfers')
    op.drop_index(op.f('ix_inventory_transfers_transfer_number'), table_name='inventory_transfers')
    op.drop_index(op.f('ix_inventory_transfers_id'), table_name='inventory_transfers')
    op.drop_table('inventory_transfers')

    # 5. Drop purchase_order_items table
    op.drop_index(op.f('ix_purchase_order_items_product_id'), table_name='purchase_order_items')
    op.drop_index(op.f('ix_purchase_order_items_purchase_order_id'), table_name='purchase_order_items')
    op.drop_index(op.f('ix_purchase_order_items_id'), table_name='purchase_order_items')
    op.drop_table('purchase_order_items')

    # 4. Drop purchase_orders table
    op.drop_index(op.f('ix_purchase_orders_created_by'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_warehouse_id'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_supplier_id'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_po_number'), table_name='purchase_orders')
    op.drop_index(op.f('ix_purchase_orders_id'), table_name='purchase_orders')
    op.drop_table('purchase_orders')

    # 3. Drop warehouse_inventory table
    op.drop_index(op.f('ix_warehouse_inventory_product_id'), table_name='warehouse_inventory')
    op.drop_index(op.f('ix_warehouse_inventory_warehouse_id'), table_name='warehouse_inventory')
    op.drop_index(op.f('ix_warehouse_inventory_id'), table_name='warehouse_inventory')
    op.drop_table('warehouse_inventory')

    # 2. Drop suppliers table
    op.drop_index(op.f('ix_suppliers_email'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_supplier_code'), table_name='suppliers')
    op.drop_index(op.f('ix_suppliers_id'), table_name='suppliers')
    op.drop_table('suppliers')

    # 1. Drop warehouses table
    op.drop_index(op.f('ix_warehouses_warehouse_code'), table_name='warehouses')
    op.drop_index(op.f('ix_warehouses_id'), table_name='warehouses')
    op.drop_table('warehouses')

    # Drop Postgres Enum types
    op.execute('DROP TYPE transferstatus')
    op.execute('DROP TYPE purchaseorderstatus')
