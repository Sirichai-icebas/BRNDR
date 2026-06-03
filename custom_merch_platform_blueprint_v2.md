# Custom Merch Platform — Production Blueprint V2
## Technical + Product + UX/UI + AI Design Spec
### Revised by Senior Developer Review — Build-Ready for Real MVP

> **Changelog V2:** ปรับ tech stack ให้เหมาะกับ production จริง, เพิ่ม environment setup, API contract, error handling strategy, testing plan, security checklist, และ deployment pipeline

---

# Project Vision

เรากำลังสร้าง:

> The Fastest Way to Order Custom Merchandise

ไม่ใช่:
- ร้านสกรีนออนไลน์
- เว็บออกแบบเสื้อ
- Canva clone

แต่คือ:

> Workflow-driven Merch Ordering Platform

ที่ช่วยให้:
- ลูกค้าออกแบบง่าย
- เห็นราคาทันที
- สั่งผลิตเร็ว
- reorder ง่าย
- ลด workflow manual

---

# Primary MVP Goal

## สิ่งที่ต้อง prove

1. ลูกค้ายอมสั่งผ่าน self-service flow
2. pricing realtime ช่วยเพิ่ม conversion
3. ลด admin workload
4. reorder behavior เกิดจริง
5. operation scale ได้มากกว่า LINE workflow

---

# Target Market (MVP)

**Focus ONLY: กลุ่มคนที่อยากทำเสื้อใส่เอง เป็นของขวัญ หรือเริ่มทำแบรนด์**

---

# User Types

## 1. Event Organizer
รายย่อยที่อยากทำเสื้อใส่เอง หรือทำแบรนด์ ให้เป็นของขวัญ หรือเสื้อวิ่งชมรม ใดๆ

Needs:
- เร็ว
- deadline ชัด
- แก้ง่าย
- reorder ง่าย
- tracking ชัด

## 2. Internal Admin
ดูแล order + production

Needs:
- workflow ชัด
- export production ง่าย
- ลด chaos
- tracking ง่าย

---

# Product Principles

1. **Fast** — ลูกค้าสั่งได้เร็วที่สุด
2. **Transparent** — เห็นราคา realtime
3. **Guided** — ไม่ต้องคิดเยอะ
4. **Repeatable** — กลับมาสั่งซ้ำง่าย

---

# ⚠️ Tech Stack — Revised (V2)

> **Developer Note:** ของเดิมบางส่วน over-engineered หรือ under-specified สำหรับ production จริง ด้านล่างคือ revised stack พร้อมเหตุผล

---

## Frontend

### Framework
**Next.js 15 (App Router)** ✅ คงเดิม

```
เหตุผล:
- App Router รองรับ Server Components → ลด bundle size
- Built-in Image Optimization ช่วย mockup loading
- เหมาะกับ SEO ของ landing page
- Vercel deployment zero-config
```

> ⚠️ **ข้อควรระวัง:** ใช้ Server Components สำหรับ static content เท่านั้น  
> Editor / Pricing panel ต้องเป็น `"use client"` เสมอ

---

### Language
**TypeScript (strict mode)** ✅ คงเดิม

```ts
// tsconfig.json — บังคับใช้ strict
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

### UI Component Library
**shadcn/ui** ✅ คงเดิม — แต่เพิ่มข้อกำหนด

```
ใช้ shadcn/ui เป็น base เท่านั้น
ห้าม import component ที่ไม่ได้ใช้จริง (tree-shaking)
ทุก custom component ต้อง follow shadcn pattern
```

---

### Styling
**TailwindCSS v4** ✅ อัปเกรดจาก v3

```
เหตุผล:
- v4 ใช้ CSS-native variables → ง่ายต่อ theming
- ไม่ต้องใช้ tailwind.config.js ซับซ้อน
- performance ดีกว่า v3 ใน large projects
```

> ⚠️ **เพิ่มใหม่:** ต้องมี design token file

```css
/* globals.css */
:root {
  --color-primary: #000000;
  --color-accent: #00f0ff;
  --color-surface: #f9f9f9;
  --radius-base: 0.5rem;
  --font-sans: 'Geist', sans-serif;
}
```

---

### State Management
**Zustand** ✅ คงเดิม — แต่เพิ่ม structure

```
ห้ามใช้ single global store
แบ่ง store ตาม domain:
- useEditorStore     → canvas state
- useOrderStore      → order + pricing
- useUserStore       → auth + session
```

```ts
// ตัวอย่าง useOrderStore
interface OrderStore {
  quantity: number;
  shirtType: string;
  hasFrontPrint: boolean;
  hasBackPrint: boolean;
  totalPrice: number;
  setQuantity: (n: number) => void;
  computePrice: () => void;
}
```

---

### Canvas Editor
**Fabric.js** ⚠️ เปลี่ยนจาก Konva.js

```
เหตุผล:
- Fabric.js มี built-in object model ครบกว่า Konva สำหรับ merch editor
- JSON serialization/deserialization ใช้งานได้ทันที (สำคัญมากสำหรับ reorder)
- Active community + maintained ถึง 2024-2025
- Konva เหมาะกับ game/animation มากกว่า design editor

Fabric.js เหมาะกับ use case นี้เพราะ:
- canvas.toJSON() → save design state
- canvas.loadFromJSON() → restore design (reorder feature)
- built-in image scaling, rotation, text
```

```ts
// การ save/load design สำหรับ reorder
const designJSON = canvas.toJSON(['id', 'name']);
// บันทึกลง DB → DESIGNS.canvas_json

// restore
canvas.loadFromJSON(savedJSON, canvas.renderAll.bind(canvas));
```

---

### Form Handling
**React Hook Form + Zod** 🆕 เพิ่มใหม่

```
เหตุผล:
- Checkout form มี validation ซับซ้อน (phone, address, event date)
- Zod ใช้ร่วมกับ backend schema validation ได้ (shared types)
- ไม่ต้องเขียน validation logic ซ้ำ
```

```ts
// shared schema (frontend + backend)
const CheckoutSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^0[0-9]{9}$/),
  eventDate: z.string().datetime(),
  address: z.string().min(10),
});
```

---

### HTTP Client
**Axios + React Query (TanStack Query)** 🆕 เพิ่มใหม่

```
เหตุผล:
- React Query จัดการ loading/error/cache state ให้อัตโนมัติ
- ลด boilerplate ของ fetch calls ใน pricing engine
- built-in retry logic
- staleTime config สำหรับ pricing cache
```

```ts
// pricing query example
const { data: pricing } = useQuery({
  queryKey: ['pricing', shirtType, quantity, printOptions],
  queryFn: () => fetchPricing({ shirtType, quantity, printOptions }),
  staleTime: 1000 * 60 * 5, // cache 5 นาที
});
```

---

## Backend

### Framework
**Python FastAPI** ✅ คงเดิม — แต่เพิ่ม structure

```
Project structure ที่ถูกต้อง:
app/
├── api/
│   ├── v1/
│   │   ├── pricing.py
│   │   ├── orders.py
│   │   ├── products.py
│   │   ├── admin.py
│   │   └── auth.py
├── core/
│   ├── config.py       ← environment variables
│   ├── security.py     ← JWT, password hashing
│   └── dependencies.py ← DI containers
├── models/             ← SQLAlchemy models
├── schemas/            ← Pydantic schemas
├── services/           ← business logic
├── repositories/       ← DB queries
└── main.py
```

> ⚠️ **สำคัญ:** Business logic ต้องอยู่ใน `services/` เท่านั้น  
> ห้ามเขียน logic ใน route handlers โดยตรง

---

### Runtime Environment
**Python 3.12+** 🆕 ระบุ version ชัดเจน

```
เหตุผล:
- 3.12 มี performance improvement ~25% เหนือ 3.10
- typing improvements ที่ใช้กับ Pydantic v2 ได้ดีกว่า
```

---

### Validation
**Pydantic v2** 🆕 เพิ่มให้ชัดเจน

```
เหตุผล:
- FastAPI ใช้ Pydantic เป็น core อยู่แล้ว
- v2 เร็วกว่า v1 มาก (Rust core)
- validate ทั้ง input และ output schemas
```

```python
# pricing schema example
class PricingRequest(BaseModel):
    shirt_type: str
    quantity: int = Field(ge=1, le=10000)
    has_front_print: bool
    has_back_print: bool
    print_technique: Literal["dtf", "silkscreen"]

class PricingResponse(BaseModel):
    unit_price: Decimal
    subtotal: Decimal
    setup_cost: Decimal
    production_days: int
    discount_applied: float
```

---

### Task Queue
**Celery + Redis** 🆕 เพิ่มใหม่ (จำเป็นสำหรับ production)

```
เหตุผล:
- งานที่ต้องทำ async: slip verification, email notification, production export
- ถ้าไม่มี task queue → endpoint จะ timeout
- Redis ใช้เป็นทั้ง broker และ result backend
```

```python
# tasks/notifications.py
@celery_app.task
def send_order_confirmation(order_id: str):
    # send email/LINE notify
    pass

@celery_app.task
def verify_payment_slip(payment_id: str, slip_url: str):
    # OCR หรือ manual trigger
    pass
```

---

## Database

### Primary Database
**PostgreSQL 16** ✅ คงเดิม — เพิ่ม version

### ORM
**SQLAlchemy 2.0 + Alembic** ✅ คงเดิม — แต่เพิ่มข้อกำหนด

```
ใช้ async SQLAlchemy (asyncpg driver) เท่านั้น
เหตุผล: FastAPI เป็น async framework ถ้าใช้ sync ORM จะ block event loop

# การเชื่อมต่อที่ถูกต้อง
DATABASE_URL = "postgresql+asyncpg://user:pass@host/db"
```

### Caching Layer
**Redis** 🆕 เพิ่มใหม่

```
ใช้ Redis สำหรับ:
1. Pricing cache (TTL 5 นาที)
2. Session storage
3. Rate limiting
4. Celery broker

หมายเหตุ: Redis instance เดียวกับ Celery broker ได้ในช่วง MVP
```

---

## Storage

### File Storage
**Cloudflare R2** ✅ คงเดิม

```
Bucket structure:
r2://merch-platform/
├── designs/          ← user uploaded artwork
│   └── {user_id}/{design_id}/{filename}
├── previews/         ← generated mockup previews
│   └── {order_id}/preview_{side}.png
├── slips/            ← payment slip uploads
│   └── {payment_id}/slip.jpg
└── exports/          ← admin production exports
    └── {date}/{export_id}.pdf
```

> ⚠️ **สำคัญ:** ไฟล์ใน `slips/` และ `designs/` ต้องเป็น **private**  
> ใช้ presigned URLs เท่านั้น — ห้าม expose URL โดยตรง

---

## Authentication

### Auth Solution
**Clerk** ✅ คงเดิม — แต่เพิ่มรายละเอียด

```
เหตุผล Clerk เหนือกว่า Auth.js สำหรับ MVP:
- User management dashboard built-in
- Webhook สำหรับ sync user ลง PostgreSQL
- Social login พร้อมใช้
- ไม่ต้องเขียน auth logic เอง

การตั้งค่า MVP:
- Email/password login
- Google OAuth (optional)
- Admin role via Clerk metadata

ห้ามใช้:
- custom JWT implementation
- session cookies แบบ manual
```

```ts
// middleware.ts — protect routes
export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    auth().protect({ role: 'admin' });
  }
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    auth().protect();
  }
});
```

---

## Email / Notification

### Email Service
**Resend** 🆕 เพิ่มใหม่

```
เหตุผล:
- Developer-friendly API
- React Email templates
- Free tier: 3,000 emails/month
- Built for Next.js/FastAPI stacks

สิ่งที่ต้อง send email:
- Order confirmation
- Payment received
- Order shipped (with tracking)
- Reorder reminder (later)
```

### LINE Notify / LINE Messaging API
**LINE Official Account** 🆕 เพิ่มใหม่ (สำคัญสำหรับตลาดไทย)

```
เหตุผล:
- Target users (event organizers ไทย) ใช้ LINE เป็นหลัก
- ส่ง order update ผ่าน LINE ได้ทันที
- Admin alert สำหรับ new order / payment received

MVP scope:
- LINE Notify สำหรับ admin alerts (ง่ายที่สุด)
- LINE Messaging API สำหรับ customer notifications (phase 2)
```

---

## Hosting & Infrastructure

### Frontend
**Vercel** ✅ คงเดิม

### Backend
**Railway** ✅ แนะนำ Railway (เหนือ Render/Fly.io สำหรับ MVP)

```
เหตุผล Railway:
- Deploy ง่ายที่สุดจาก 3 ตัว
- Built-in PostgreSQL + Redis provisioning
- ราคาถูกในช่วง low traffic
- ไม่ต้อง configure Docker ใน production

Services ที่ต้องรันบน Railway:
- fastapi-app      (main API)
- celery-worker    (background tasks)
- redis            (built-in plugin)
- postgresql       (built-in plugin)
```

### Database Hosting
**Railway PostgreSQL** 🆕 เปลี่ยนจาก Supabase/Neon

```
เหตุผล:
- ใช้ Railway ทั้งหมดเลย ง่ายกว่า manage หลาย platform
- Supabase ดีแต่มี abstraction layer ที่ไม่จำเป็น
- Neon ดี แต่ serverless PostgreSQL มี cold start ที่ไม่เหมาะกับ pricing engine

ถ้าจะใช้ Supabase: ใช้เฉพาะ PostgreSQL โดยตรง ไม่ต้องใช้ Supabase client
```

---

# Revised Database Schema (V2)

> เพิ่ม indexes, constraints, timestamps ที่จำเป็นสำหรับ production

```sql
-- USERS
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    VARCHAR(255) UNIQUE NOT NULL,  -- Clerk user ID
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  role        VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  sku           VARCHAR(100) UNIQUE NOT NULL,
  available_colors JSONB NOT NULL DEFAULT '[]',  -- ["black", "white", "navy"]
  base_cost     NUMERIC(10, 2) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PRICING_RULES (แยกออกมาเป็น table จาก products)
CREATE TABLE pricing_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id),
  print_technique VARCHAR(50) CHECK (print_technique IN ('dtf', 'silkscreen', 'embroidery')),
  min_quantity    INT NOT NULL,
  max_quantity    INT,
  print_cost_front NUMERIC(10, 2) NOT NULL DEFAULT 0,
  print_cost_back  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  setup_cost      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  rush_multiplier NUMERIC(4, 2) DEFAULT 1.0,
  margin_percent  NUMERIC(5, 2) DEFAULT 30.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DESIGNS
CREATE TABLE designs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  name        VARCHAR(255),
  canvas_json JSONB NOT NULL,             -- Fabric.js JSON state
  preview_front_url TEXT,
  preview_back_url  TEXT,
  color       VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_designs_user_id ON designs(user_id);

-- ORDERS
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(20) UNIQUE NOT NULL,  -- ORD-2025-0001 (human readable)
  user_id          UUID REFERENCES users(id),
  status           VARCHAR(50) DEFAULT 'pending_payment'
                   CHECK (status IN (
                     'pending_payment', 'payment_review',
                     'confirmed', 'preparing', 'production',
                     'qc', 'shipped', 'delivered', 'cancelled'
                   )),
  total_price      NUMERIC(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  event_date       DATE,
  notes            TEXT,
  tracking_number  VARCHAR(100),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ORDER_ITEMS
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  design_id       UUID REFERENCES designs(id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(10, 2) NOT NULL,
  print_technique VARCHAR(50),
  size_breakdown  JSONB NOT NULL DEFAULT '{}'  -- {"S":10,"M":20,"L":15}
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- PAYMENTS
CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id),
  amount      NUMERIC(10, 2) NOT NULL,
  method      VARCHAR(50) CHECK (method IN ('promptpay', 'bank_transfer')),
  slip_url    TEXT,
  status      VARCHAR(30) DEFAULT 'pending'
              CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

# API Contract (V2)

> กำหนด API endpoints ชัดเจนก่อน build เพื่อ frontend-backend ทำงานพร้อมกันได้

```
Base URL: https://api.yourplatform.com/api/v1
Auth: Bearer token (Clerk JWT) ใน Authorization header
```

## Pricing API
```
POST   /pricing/calculate
       Body: PricingRequest
       Response: PricingResponse
       Auth: public (ไม่ต้อง login)
       Cache: 5 นาที ตาม query params
```

## Products API
```
GET    /products                    → list products
GET    /products/{id}               → product detail + colors
```

## Designs API
```
POST   /designs                     → save design
GET    /designs/{id}                → get design
GET    /designs/mine                → user's designs (auth required)
PUT    /designs/{id}                → update design
POST   /designs/{id}/preview        → generate preview image
```

## Orders API
```
POST   /orders                      → create order (auth required)
GET    /orders/mine                 → user's orders
GET    /orders/{id}                 → order detail
POST   /orders/{id}/reorder         → clone order as new draft
```

## Payments API
```
POST   /payments/{order_id}/upload-slip   → upload payment slip
GET    /payments/{order_id}/status        → check payment status
```

## Admin API
```
GET    /admin/orders                → all orders (paginated, filterable)
PUT    /admin/orders/{id}/status    → update order status
GET    /admin/orders/export         → export production sheet (PDF/CSV)
POST   /admin/payments/{id}/approve → approve payment
POST   /admin/payments/{id}/reject  → reject payment
```

---

# Environment Variables

> ต้องมีไฟล์นี้ตั้งแต่วันแรก — ห้ามเขียน secrets ใน code

## Frontend (.env.local)
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
```

## Backend (.env)
```bash
# App
ENVIRONMENT=development  # development | staging | production
SECRET_KEY=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/merch_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=merch-platform
R2_PUBLIC_URL=https://your-r2-domain.com

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=orders@yourplatform.com

# LINE Notify (Admin alerts)
LINE_NOTIFY_TOKEN=...
```

---

# Error Handling Strategy

> ต้องมี consistent error format ตั้งแต่ต้น

## Backend Error Response Format
```python
# schemas/errors.py
class ErrorResponse(BaseModel):
    code: str          # "PRICING_ERROR", "ORDER_NOT_FOUND"
    message: str       # human-readable
    detail: dict | None = None

# ตัวอย่าง
{
  "code": "QUANTITY_TOO_LOW",
  "message": "Minimum order quantity is 10 pieces",
  "detail": {"minimum": 10, "provided": 5}
}
```

## Frontend Error Handling
```ts
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) { super(message); }
}

// ใช้ใน React Query
onError: (error: ApiError) => {
  toast.error(error.message);
}
```

---

# Security Checklist (MVP)

> ต้องทำทุกข้อก่อน go live

### API Security
- [ ] Rate limiting บน pricing endpoint (100 req/min per IP)
- [ ] Rate limiting บน order creation (10 orders/hour per user)
- [ ] Validate Clerk JWT ทุก protected endpoint
- [ ] ตรวจสอบ user ownership ก่อน return data (`order.user_id === currentUser.id`)
- [ ] Admin routes ตรวจ role จาก Clerk metadata

### File Upload Security
- [ ] ตรวจ file type ด้วย magic bytes ไม่ใช่แค่ extension
- [ ] จำกัด file size: artwork ≤ 20MB, slip ≤ 5MB
- [ ] Scan virus (ClamAV หรือ Cloudflare Gateway)
- [ ] ใช้ presigned URL เสมอ — ไม่ expose R2 bucket โดยตรง

### Data Security
- [ ] Sanitize HTML input ทุก text field
- [ ] ไม่ log sensitive data (phone, address)
- [ ] HTTPS only (enforce ใน production)
- [ ] SQL injection prevention (SQLAlchemy parameterized queries)

---

# Testing Strategy

## Frontend
```
Unit tests: Vitest + React Testing Library
E2E tests: Playwright

Priority test cases:
- Pricing calculator output correctness
- Checkout form validation
- Editor save/load state (สำคัญสำหรับ reorder)
```

## Backend
```
Unit tests: pytest + pytest-asyncio
Integration tests: pytest + httpx (async test client)

Priority test cases:
- Pricing engine calculation accuracy
- Order creation flow
- Payment status transitions
- Admin export generation
```

```bash
# run all tests
pytest tests/ -v --asyncio-mode=auto

# coverage report
pytest --cov=app tests/
```

---

# Development Workflow

## Local Development Setup
```bash
# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head           # run migrations
uvicorn app.main:app --reload  # start dev server

# Frontend
npm install
npm run dev

# Background worker
celery -A app.worker worker --loglevel=info

# Redis (Docker)
docker run -d -p 6379:6379 redis:alpine
```

## Git Branching Strategy
```
main          → production
staging       → staging environment
dev           → integration branch
feature/*     → new features
fix/*         → bug fixes
```

## Pull Request Rules
- ต้อง pass CI pipeline ก่อน merge
- ต้อง review จาก 1 คน
- ห้าม merge feature → main โดยตรง (ผ่าน staging ก่อน)

---

# CI/CD Pipeline

## GitHub Actions (ตัวอย่าง)
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: pytest tests/ --asyncio-mode=auto

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test
      - run: npm run build  # ตรวจว่า build ไม่ error

  deploy-staging:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/staging'
    # deploy to Railway staging
```

---

# Core MVP Features

## 1. Landing Page

### Sections
- **Hero:** CTA + mockup preview + "ออกแบบและรู้ราคาทันที"
- **How It Works:** 4 ขั้นตอน (Upload → Preview → Price → Order)
- **Social Proof:** ตัวอย่างงานจริง (เพิ่มทีหลัง)
- **FAQ:** คำถามที่พบบ่อย (delivery time, minimum order, payment)
- **CTA:** "เริ่มออกแบบเลย"

---

## 2. Product Catalog

### MVP Scope
- Running shirts เท่านั้น (3-5 รุ่น)
- จำกัด colors ต่อรุ่น (≤ 6 สี)
- แสดง base price ชัดเจน

---

## 3. Design Editor

### Required Features
- Upload Image (PNG/JPG/SVG, ≤ 20MB)
- Move / Resize / Rotate object
- Add Text (font, size, color)
- Front/Back Toggle
- Shirt Color Selection (live preview)
- Save Design (JSON to DB)
- Generate Preview (canvas.toDataURL)

### DO NOT BUILD
- ❌ Layer panel / z-index management ที่ซับซ้อน
- ❌ Smart snapping grid
- ❌ AI image generation
- ❌ Advanced typography (kerning, etc.)
- ❌ Collaboration / multi-user

---

## 4. Real-time Pricing Engine

### Inputs
- shirt_type
- quantity
- has_front_print (bool)
- has_back_print (bool)
- print_area_cm2 (optional)
- print_technique (dtf / silkscreen)
- rush_delivery (bool)

### Output (แสดงทันที)
- unit_price
- subtotal
- setup_cost
- total_price
- production_days
- quantity_discount (%)

### Pricing Logic
```python
def calculate_price(req: PricingRequest) -> PricingResponse:
    rule = get_pricing_rule(req.product_id, req.quantity, req.technique)
    
    shirt_cost = rule.base_cost * req.quantity
    print_cost = (
        (rule.print_cost_front if req.has_front else 0) +
        (rule.print_cost_back if req.has_back else 0)
    ) * req.quantity
    setup_cost = rule.setup_cost
    
    subtotal = shirt_cost + print_cost + setup_cost
    margin = subtotal * (rule.margin_percent / 100)
    total = subtotal + margin
    
    if req.rush_delivery:
        total *= rule.rush_multiplier
    
    return PricingResponse(
        unit_price=total / req.quantity,
        subtotal=subtotal,
        total_price=total,
        production_days=calculate_production_days(req),
    )
```

---

## 5. Checkout Flow

### Fields
- ชื่อผู้สั่ง
- เบอร์โทรศัพท์
- ที่อยู่จัดส่ง
- วันที่งาน (event date)
- size breakdown (S/M/L/XL/XXL จำนวนแต่ละไซส์)
- หมายเหตุ

### Payment (MVP)
- PromptPay QR (generate จาก order total)
- Bank Transfer พร้อม upload slip

---

## 6. Order Dashboard (Customer)

### แสดง
- order status (timeline)
- mockup preview
- invoice download (PDF)
- tracking number
- reorder button

---

## 7. Reorder System

### Flow
1. ลูกค้ากด "Reorder" จาก order ที่ผ่านมา
2. Clone design_json ไปยัง editor
3. อนุญาตแก้ไข quantity, size breakdown
4. ผ่าน pricing engine ใหม่
5. Checkout ปกติ

> **Technical Note:** Reorder ทำงานได้ถ้า `designs.canvas_json` ถูกบันทึกถูกต้อง  
> ต้อง test reorder flow ทุก sprint

---

## 8. Admin Dashboard

### Order Table (columns)
- Order ID / Number
- Customer name + phone
- Quantity + product
- Payment status
- Order status
- Event date (deadline)
- Actions

### Features
- Filter by status / date
- Search by order number / customer
- Bulk status update
- Download artwork (presigned R2 URL)
- Generate production sheet (PDF)
- Add tracking number

---

# Development Timeline (Revised)

## Phase 0 — Foundation (Week 0-1)

**ต้องทำก่อนเริ่ม feature ใดๆ:**
- [ ] Repo setup (monorepo หรือ separate repos)
- [ ] Environment variables ทั้งหมด
- [ ] Database schema + migrations
- [ ] Clerk setup + webhook sync users → DB
- [ ] CI pipeline (GitHub Actions)
- [ ] Staging environment (Railway)
- [ ] R2 bucket + presigned URL utility

---

## Phase 1 — Core (Week 2-3)

- [ ] Landing page
- [ ] Product catalog API + UI
- [ ] Design editor (Fabric.js)
- [ ] Design save/load

---

## Phase 2 — Pricing + Checkout (Week 4-5)

- [ ] Pricing engine (backend)
- [ ] Realtime pricing panel (frontend)
- [ ] Checkout form
- [ ] Payment slip upload
- [ ] Order creation
- [ ] Email confirmation (Resend)
- [ ] LINE Notify → admin

---

## Phase 3 — Dashboard + Admin (Week 6-7)

- [ ] Customer order dashboard
- [ ] Order status timeline
- [ ] Invoice PDF generation
- [ ] Reorder flow
- [ ] Admin order table
- [ ] Admin status update
- [ ] Production export

---

## Phase 4 — QA + Launch (Week 8)

- [ ] E2E testing (Playwright)
- [ ] Load test pricing endpoint
- [ ] Security checklist review
- [ ] Performance audit (Lighthouse ≥ 90)
- [ ] Soft launch (invite-only)

---

# MVP Success Metrics

## Conversion
- Visitor → Start Design: > 20%
- Start Design → Checkout: > 40%
- Checkout → Order Confirmed: > 80%

## Operations
- Admin time per order: < 5 นาที
- Production delay %: < 10%
- Reorder rate (30 days): > 15%

## Technical
- Pricing API response time: < 200ms
- Page load (LCP): < 2.5s
- Uptime: > 99.5%

---

# UX/UI Design Direction

## ความรู้สึกที่ต้องการ

✅ Modern creator tool  
✅ Fast commerce platform  
✅ Simple design workflow

❌ ไม่ใช่โรงงาน  
❌ ไม่ใช่ ERP  
❌ ไม่ใช่ B2B dashboard ที่น่าเบื่อ

## UI Style
- Clean / Minimal / High whitespace
- Bold CTA
- Fast micro-interactions
- Mobile-responsive (event organizer ใช้มือถือ)

## Color Direction
- Primary: Black / White base
- Accent: Electric blue (#00f0ff) หรือ neon running accent
- Warning/CTA: Strong contrast

## Typography
- Display: Geist / Satoshi
- Body: Inter (acceptable ที่นี่เพราะ functional UI)

## Inspiration
- Canva (editor UX)
- Stripe (pricing transparency)
- Linear (dashboard clarity)
- Printful (merch preview)

---

# Long-term Vision

## Future Roadmap (Post-MVP)

**Phase 5:** Multi-factory routing  
**Phase 6:** Creator storefront (event organizer มี public page)  
**Phase 7:** Embedded merch APIs (สำหรับ race management apps)  
**Phase 8:** Manufacturing network (SEA expansion)  
**Phase 9:** Workflow SaaS (white-label สำหรับ print shops)

---

# Final Strategic Reminder

**Optimize for:**
- ✅ Workflow efficiency
- ✅ Speed
- ✅ Trust
- ✅ Reorder behavior

**Do NOT optimize for:**
- ❌ Feature count
- ❌ Technical complexity
- ❌ Premature scaling

---

> **Mission:** Replace chaotic LINE-based merch ordering  
> with a fast, structured workflow platform  
> that customers actually **prefer** using.

---

*Blueprint V2 — Revised for production readiness*  
*Last updated: 2025*
