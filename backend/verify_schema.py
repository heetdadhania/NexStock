from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend folder
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
import sys, os
from sqlalchemy import create_engine, text

# Ensure the backend directory is on the path for imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

queries = {
    "tables": "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;",
    "roles_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='roles' ORDER BY ordinal_position;",
    "users_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position;",
    "categories_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' ORDER BY ordinal_position;",
    "products_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='products' ORDER BY ordinal_position;",
    "inventory_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='inventory' ORDER BY ordinal_position;",
    "stock_movements_columns": "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='stock_movements' ORDER BY ordinal_position;",
    "foreign_keys": "SELECT tc.table_name, kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY';",
    "unique_constraints": "SELECT tc.constraint_name, tc.table_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema='public';",
    "indexes": "SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname='public';"
}

with engine.connect() as conn:
    for name, sql in queries.items():
        print(f"--- {name.upper()} ---")
        result = conn.execute(text(sql))
        rows = result.fetchall()
        if rows:
            # Print as tab-separated values
            headers = result.keys()
            print('\t'.join(headers))
            for row in rows:
                print('\t'.join(str(v) if v is not None else '' for v in row))
        else:
            print("(no rows)")
        print()
