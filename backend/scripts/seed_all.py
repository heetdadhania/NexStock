import sys, os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the project root .env
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Ensure the scripts directory is on sys.path so that local seed modules can be imported
scripts_path = os.path.abspath(os.path.dirname(__file__))
sys.path.append(scripts_path)

# Also add the backend directory for the 'app' package imports used in seed scripts
backend_path = os.path.abspath(os.path.join(scripts_path, '..'))
sys.path.append(backend_path)

from seed_roles import run as seed_roles
from seed_users import run as seed_users
from seed_categories import run as seed_categories
from seed_products import run as seed_products
from seed_inventory import run as seed_inventory
from seed_movements import run as seed_movements


def _run_step(name: str, fn) -> None:
    print(f"[*] Starting {name}…")
    try:
        fn()
        print(f"[+] {name} completed.")
    except Exception as exc:
        print(f"[-] {name} failed: {exc}")
        raise SystemExit(1)


def main() -> None:
    """Execute all seed scripts in the required order."""
    steps = [
        ("seed_roles.py", seed_roles),
        ("seed_users.py", seed_users),
        ("seed_categories.py", seed_categories),
        ("seed_products.py", seed_products),
        ("seed_inventory.py", seed_inventory),
        ("seed_movements.py", seed_movements),
    ]
    for name, fn in steps:
        _run_step(name, fn)
    print("[+] All seed scripts executed successfully.")


if __name__ == "__main__":
    main()
