# NexStock

> Warehouse Inventory Management Platform

A full-stack warehouse management system for tracking products, categories, inventory levels, stock movements, and operational analytics through a professional SaaS-style dashboard.

---

## Features

- **Authentication** — JWT-based login with role-based access (Admin, Manager)
- **Category Management** — Full CRUD with uniqueness validation and delete guard
- **Product Management** — SKU-based products with soft delete and auto inventory creation
- **Inventory Management** — Stock In/Out with movement tracking and low stock alerts
- **Dashboard** — KPI cards, inventory trend chart, low stock widget, recent activity
- **Reports** — Inventory, stock movement, and low stock reports with CSV export
- **Profile** — View current user info

---

## Tech Stack

**Frontend**
- React · TypeScript · Vite
- Tailwind CSS · Shadcn/UI
- Axios · React Hook Form · Zod · Recharts

**Backend**
- Python · FastAPI · SQLAlchemy · Pydantic v2
- Alembic · JWT · Passlib (bcrypt)

**Infrastructure**
- PostgreSQL — Neon
- Frontend — Vercel
- Backend — Railway

---

## Project Structure

```
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

- Python 3.11+
- Node.js 18+
- PostgreSQL database (Neon recommended)

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

```
roles          → id, name
users          → id, name, email, password_hash, role_id, is_active
categories     → id, name, description
products       → id, sku (unique), name, category_id, unit_price, is_active
inventory      → id, product_id (unique), current_quantity, minimum_quantity, maximum_quantity
stock_movements → id, product_id, movement_type (IN/OUT), quantity, remarks, created_by
```

---

## API Reference

| Module | Method | Endpoint |
|--------|--------|----------|
| Auth | POST | /api/auth/login |
| Auth | GET | /api/auth/me |
| Categories | GET/POST | /api/categories |
| Categories | PUT/DELETE | /api/categories/{id} |
| Products | GET/POST | /api/products |
| Products | PUT/DELETE | /api/products/{id} |
| Inventory | GET | /api/inventory |
| Inventory | POST | /api/inventory/stock-in |
| Inventory | POST | /api/inventory/stock-out |
| Inventory | GET | /api/inventory/movements |
| Dashboard | GET | /api/dashboard/stats |
| Dashboard | GET | /api/dashboard/inventory-trend |
| Dashboard | GET | /api/dashboard/low-stock |
| Reports | GET | /api/reports/inventory |
| Reports | GET | /api/reports/stock-movements |
| Reports | GET | /api/reports/low-stock |
| Reports | GET | /api/reports/export/{type} |

Full interactive docs at `/docs` (Swagger UI).

---

## User Roles

| Permission | Admin | Manager |
|------------|:-----:|:-------:|
| Manage Categories | ✅ | ✅ |
| Manage Products | ✅ | ✅ |
| Manage Inventory | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
| View Reports | ✅ | ✅ |
| Delete Categories | ✅ | ❌ |
| Manage Users | ✅ | ❌ |

---

## Roadmap

| Version | Name | Status |
|---------|------|--------|
| v1.0.0 | Core Warehouse Management | ✅ Completed |
| v2.0.0 | Multi-Warehouse Operations | Planned |
| v3.0.0 | Intelligence Analytics | Planned |
| v4.0.0 | Warehouse Optimization | Planned |
| v5.0.0 | Digital Twin Warehouse | Planned |
| v6.0.0 | AI Warehouse Commander | Planned |

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
#
