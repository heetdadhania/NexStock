"""create stock movements table

Revision ID: c19d83b2b01
Revises: b28d73b22a01
Create Date: 2026-06-07 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c19d83b2b01'
down_revision: Union[str, None] = 'b28d73b22a01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Commands to create stock_movements table
    # Declare the postgres enum type
    movement_type_enum = sa.Enum('IN', 'OUT', name='movementtype')
    
    op.create_table(
        'stock_movements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('movement_type', movement_type_enum, nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('remarks', sa.String(length=255), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stock_movements_id'), 'stock_movements', ['id'], unique=False)
    op.create_index(op.f('ix_stock_movements_created_by'), 'stock_movements', ['created_by'], unique=False)


def downgrade() -> None:
    # Commands to drop stock_movements table
    op.drop_index(op.f('ix_stock_movements_created_by'), table_name='stock_movements')
    op.drop_index(op.f('ix_stock_movements_id'), table_name='stock_movements')
    op.drop_table('stock_movements')

    # Drop the postgres enum type
    op.execute('DROP TYPE movementtype')
