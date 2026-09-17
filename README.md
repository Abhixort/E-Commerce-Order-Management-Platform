# E-Commerce Order Management Platform

[![CI/CD Pipeline](https://github.com/example/ecommerce-order-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/example/ecommerce-order-platform/actions)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-emerald)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-7.0-red)
![Celery](https://img.shields.io/badge/Celery-5.3-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

A production-grade, distributed **E-Commerce Order Management Platform** built with **FastAPI**, **Next.js 14+ (App Router)**, **PostgreSQL**, **Redis**, **Celery**, **Docker**, **Pytest**, and **GitHub Actions**.

---

## 🌟 Key Features & Capabilities

- **REST APIs with FastAPI & Pydantic v2**: High performance, type-safe API endpoints with interactive Swagger UI (`/docs`).
- **JWT & Role-Based Authorization (RBAC)**: Secure access control supporting `ADMIN`, `MANAGER`, and `CUSTOMER` roles.
- **Asynchronous Task Engine (Celery + Redis)**: Offloads order stock reservation, inventory updates, payment gateway simulation, and status notifications to background workers.
- **PostgreSQL Schema & ACID Concurrency**: Indexed tables for fast catalog searching, cart items, order histories, and audit logs.
- **Redis Caching & Rate Limiting**: Response caching for product catalog requests and `slowapi` rate-limiting to prevent API abuse.
- **Modern Next.js 14 Frontend**: Responsive glassmorphism web interface with live storefront, cart drawer, order tracking, admin analytics dashboard, and 1-click demo logins.
- **Automated Pytest Suite**: Comprehensive unit and integration test coverage for authentication, products, cart, and async order tasks.
- **Containerization & CI/CD**: One-command `docker-compose up` setup and GitHub Actions workflow.

---

## 🏗 System Architecture

```
                               ┌──────────────────────────┐
                               │ Next.js 14 Frontend App  │
                               │ (Storefront & Admin Hub) │
                               └────────────┬─────────────┘
                                            │ HTTP / JWT
                                            ▼
                               ┌──────────────────────────┐
                               │   FastAPI REST Engine    │
                               │ (Auth, Product, Orders)  │
                               └──────┬─────────────┬─────┘
                                      │             │
                    ┌─────────────────┘             └─────────────────┐
                    ▼                                                 ▼
        ┌───────────────────────┐                         ┌───────────────────────┐
        │  PostgreSQL Database  │                         │      Redis Cache      │
        │ (Users, Orders, Audit)│                         │  & Task Broker Queue  │
        └───────────────────────┘                         └───────────┬───────────┘
                                                                      │
                                                                      ▼
                                                          ┌───────────────────────┐
                                                          │ Celery Worker Engine  │
                                                          │(Order Stock Deduction)│
                                                          └───────────────────────┘
```

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (Recommended)

Run the full platform stack (FastAPI Backend, Next.js Frontend, PostgreSQL, Redis, Celery Worker) with one command:

```bash
docker-compose up --build
```

- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **OpenAPI Swagger Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

# Run FastAPI Server
uvicorn app.main:app --reload --port 8000
```

#### 2. Run Celery Worker (In separate terminal)
```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔑 Preset Demo Accounts

You can test the platform instantly using the built-in preset login buttons on the login page (`/login`):

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Full access to Admin Dashboard, Analytics, Inventory Adjustments & Products |
| **Manager** | `manager@example.com` | `manager123` | Access to Product Catalog CRUD & Inventory Adjustments |
| **Customer** | `customer@example.com` | `customer123` | Access to Storefront, Cart, Checkout, and Order Tracker |

---

## 🧪 Running Automated Tests

Run the backend Pytest suite with code coverage:

```bash
cd backend
pytest --cov=app --cov-report=term-missing
```

---

## 🛠 GitHub Actions CI Pipeline

The project includes a pre-configured `.github/workflows/ci.yml` pipeline that automatically:
1. Provisions PostgreSQL and Redis service containers.
2. Executes backend unit and integration test suites.
3. Validates Next.js production builds.
