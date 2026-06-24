# NexStock

> Multi-Warehouse Operations Platform

A full-stack warehouse operations management platform for managing multiple warehouses, suppliers, purchase orders, inventory transfers, stock movements, and operational analytics through a professional SaaS-style dashboard.

---

## Features

* **Authentication** — JWT-based login with role-based access (Admin, Manager)
* **Warehouse Management** — Create, update, and manage multiple warehouse locations
* **Supplier Management** — Supplier records, contact information, and performance tracking
* **Purchase Orders** — Draft, approve, receive, and cancel purchase orders
* **Inventory Transfers** — Transfer products between warehouses with status tracking
* **Warehouse Inventory** — Track inventory separately for each warehouse
* **Activity Logs** — System-wide activity tracking and audit history
* **Dashboard** — KPI cards, warehouse analytics, transfer metrics, and operational insights
* **Reports** — Warehouse inventory, supplier, purchase order, and transfer reports
* **Profile** — View current user information

---

## Tech Stack

**Frontend**

* React · TypeScript · Vite
* Tailwind CSS · Shadcn/UI
* Axios · React Hook Form · Zod · Recharts

**Backend**

* Python · FastAPI · SQLAlchemy · Pydantic v2
* Alembic · JWT · Passlib (bcrypt)

**Infrastructure**

* PostgreSQL — Neon
* Frontend — Vercel
* Backend — Railway

---

## Project Structure

```text
nexstock/
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── core/           # Config, security, dependencies
│   │   ├── db/             # Database session
│   │   ├── models/         # SQLAlchemy models
│   │   ├── repositories/   # DB queries
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py
│   ├── scripts/            # Seed scripts
│   ├── alembic/            # Migrations
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── services/
        ├── hooks/
        ├── layouts/
        ├── routes/
        └── types/
```

---

## Getting Started

### Prerequisites

* Python 3.11+
* Node.js 18+
* PostgreSQL database (Neon recommended)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/nexstock.git
cd nexstock
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

```env
DATABASE_URL=your_neon_postgres_connection_string
SECRET_KEY=your_random_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Run migrations:

```bash
alembic upgrade head
```

Seed demo data:

```bash
python scripts/seed_all.py
```

Start the server:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App available at `http://localhost:5173`

---

## Database Schema

```text
roles

users

categories

products

inventory

stock_movements

warehouses
→ id, warehouse_code, warehouse_name, city, state, country

warehouse_inventory
→ id, warehouse_id, product_id, quantity, minimum_quantity, maximum_quantity

suppliers
→ id, supplier_code, supplier_name, contact_person, email, phone

purchase_orders
→ id, po_number, supplier_id, warehouse_id, status

purchase_order_items
→ id, purchase_order_id, product_id, quantity, unit_price

inventory_transfers
→ id, transfer_number, source_warehouse_id, destination_warehouse_id, status

inventory_transfer_items
→ id, transfer_id, product_id, quantity

activity_logs
→ id, user_id, action, entity_type, entity_id, created_at
```

---

## API Reference

| Module          | Method   | Endpoint                          |
| --------------- | -------- | --------------------------------- |
| Auth            | POST     | /api/auth/login                   |
| Auth            | GET      | /api/auth/me                      |
| Warehouses      | GET/POST | /api/warehouses                   |
| Warehouses      | PUT      | /api/warehouses/{id}              |
| Suppliers       | GET/POST | /api/suppliers                    |
| Suppliers       | PUT      | /api/suppliers/{id}               |
| Purchase Orders | GET/POST | /api/purchase-orders              |
| Purchase Orders | POST     | /api/purchase-orders/{id}/approve |
| Purchase Orders | POST     | /api/purchase-orders/{id}/receive |
| Purchase Orders | POST     | /api/purchase-orders/{id}/cancel  |
| Transfers       | GET/POST | /api/transfers                    |
| Transfers       | POST     | /api/transfers/{id}/approve       |
| Transfers       | POST     | /api/transfers/{id}/complete      |
| Transfers       | POST     | /api/transfers/{id}/cancel        |
| Activity Logs   | GET      | /api/activity-logs                |
| Dashboard       | GET      | /api/dashboard                    |
| Reports         | GET      | /api/reports/warehouse-inventory  |
| Reports         | GET      | /api/reports/suppliers            |
| Reports         | GET      | /api/reports/purchase-orders      |
| Reports         | GET      | /api/reports/transfers            |

Full interactive docs at `/docs` (Swagger UI).

---

## User Roles

| Permission             | Admin | Manager |
| ---------------------- | :---: | :-----: |
| Manage Warehouses      |   ✅   |    ❌    |
| Manage Suppliers       |   ✅   |    ❌    |
| Manage Purchase Orders |   ✅   |    ✅    |
| Manage Transfers       |   ✅   |    ✅    |
| Manage Inventory       |   ✅   |    ✅    |
| View Dashboard         |   ✅   |    ✅    |
| View Reports           |   ✅   |    ✅    |
| View Activity Logs     |   ✅   |    ❌    |

---

## Roadmap

| Version | Name                       | Status      |
| ------- | -------------------------- | ----------- |
| v1.0.0  | Core Warehouse Management  | ✅ Completed |
| v2.0.0  | Multi-Warehouse Operations | ✅ Completed |
| v3.0.0  | Intelligence Analytics     | Planned     |
| v4.0.0  | Warehouse Optimization     | Planned     |
| v5.0.0  | Digital Twin Warehouse     | Planned     |
| v6.0.0  | AI Warehouse Commander     | Planned     |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request to `develop`

---

## License

This project is licensed under the MIT License.
