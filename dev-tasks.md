# DEV TASKS — Custom Merch Platform (Full-Stack)

> **วิธีใช้:** สั่ง `dev task1`, `dev task2` … ทีละอัน AI ทำเฉพาะ task นั้นจนจบแล้วส่งมอบ
> **Source of truth:** ไฟล์นี้คือ task หลัก — ระบุ frontend + backend + database ครบ
> **Blueprint:** `custom_merch_platform_blueprint_v2.md` = บริบท/domain model/schema/pricing/security
> อ้างอิงด้วยป้าย `📘 BP §<หัวข้อ>` เมื่อจำเป็น — **แต่ stack จริงตามไฟล์นี้** (ดู Architecture Decisions)

> **กติกาทุก task:**
> - แต่ละ task มี **Deliverable** ที่ทำงานได้จริง (รัน/เห็นผลได้) ไม่ใช่โค้ดครึ่งๆ
> - ทำตาม **Files**, **Depends on**, **Acceptance** ที่ระบุ
> - TypeScript strict, ไม่มี `any`, ไม่ทิ้ง TODO ที่ทำให้ feature พัง
> - หลังทำเสร็จ: commit `taskN: <สรุป>` และระบุว่าทดสอบยังไง
> - **backend task (21–32): ทุกตัวต้องมี unit test** ของ service/route หลัก (Vitest) เป็นส่วนหนึ่งของ Acceptance
> - asset ที่ยังไม่มี → ใช้ placeholder ที่ระบุ และโน้ตไว้
> - **อย่าหยิบงานจาก Deferred section** (ท้ายไฟล์) — over-engineer

---

# 📍 PROGRESS — ทำถึงไหนแล้ว

> **ทำเสร็จล่าสุด: task1** · **task ถัดไป: task2** (ดูเฉพาะ task ที่จะทำ — ประหยัด token ไม่ต้องอ่านที่ ✅ แล้ว)

- [x] **task1** — Scaffold + Tooling (Next.js + TS strict + Tailwind v4 + shadcn) ✅
- [ ] task2 — Type Definitions ← **next**
- [ ] task3–4 · task5 · task6–9 · task10–12 · task13–15 · task16–18 · task19–20 (MVP-1)
- [ ] task21–22 (DB) · task23–24 (persist) · 🟡 task25 (pricing — `pricing.ts` config+calc เสร็จแล้ว, เหลือ DB/API/panel/test) · task26–27 (order/pay) · task28 (auth) · task29–30 (dashboards) · task31 (storage) · task32 (invoice/notify) · task33 (landing, post-MVP)

**รวม 33 tasks · เสร็จ 1 · เหลือ 32**

---

# ⚙️ Architecture Decisions (อ่านก่อน — ทำไม stack ต่างจาก blueprint)

| เรื่อง | blueprint v2 | **ที่ใช้จริง** | เหตุผล |
|------|-------------|--------------|--------|
| Backend | Python FastAPI (แยก service) | **Next.js Route Handlers** (`app/api/v1/*`) | stack เดียว (TS), deploy ที่เดียว, ไม่ต้อง maintain 2 ภาษา |
| ORM | SQLAlchemy + Alembic | **Prisma** | typed client + migration ในตัว, เข้ากับ TS |
| Validation | Pydantic v2 | **Zod** (share FE/BE) | มีใน stack แล้ว, schema ใช้ร่วมสองฝั่ง |
| Pricing engine | Python | **TypeScript** (`src/lib/pricing.ts`) | เป็นเลขคณิตธรรมดา ไม่ต้องใช้ Python |
| Task queue (Celery+Redis) | บังคับ | **Next `after()` / bg** จนกว่าจะจำเป็น | ดู Deferred |
| DB / Auth / Storage / Email | Postgres / Clerk / R2 / Resend | **เหมือน blueprint** | ตามเดิม |

> domain model, DB schema, pricing logic, API contract, security checklist → **ยึดตาม blueprint** (แค่เปลี่ยนภาษา/เครื่องมือ)

---

# 🗺️ Phase Overview

| Phase | Group | Tasks | ผลลัพธ์ |
|-------|-------|-------|--------|
| **MVP-1** | A–G | task1–20 | Frontend editor + ส่งแบบเข้าอีเมล (ไม่มี DB) |
| **Backend** | H | task21–22 | DB + Prisma schema |
| **Persist** | I | task23–24 | Products + Designs ลง DB |
| **Commerce** | J–K | task25–27 | Pricing + Orders + Payment |
| **Account** | L–M | task28–30 | Auth + Customer/Admin dashboard |
| **Assets** | N | task31 | R2 storage |
| **Notify** | O | task32 | Invoice PDF + customer notifications |
| **Marketing** | P | task33 | Landing page (post-MVP) |

---

# 🏗️ GROUP A — Foundation (task1–4)

> 📘 BP §Tech Stack, §UX/UI Design Direction

## task1 — Project Scaffold + Tooling ✅ DONE
**Goal:** Next.js + strict TS + Tailwind v4 + shadcn รันได้
**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- [x] App Router, TS strict (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- [x] shadcn + `button dialog input select label sonner`
- [x] design tokens ใน `globals.css` (`--color-primary/accent/surface`, `--radius-base`)
- [x] โครงโฟลเดอร์ครบ (app/editor, app/api/submit-design, components, stores, lib, types)
**Acceptance:** [x] `npm run dev` · [x] `npm run build` · [x] `tsc --noEmit` ผ่านหมด
> commit: `97e044a` · Next.js 16.2.7 (ไม่ downgrade เป็น 15)

---

## task2 — Type Definitions + Domain Models
**Goal:** type กลางที่ทุก feature ใช้ร่วม (single source of truth)
**Files:** `src/types/editor.ts`, `src/types/product.ts`
**Depends on:** task1
```ts
// product.ts
export type NeckType = 'crew' | 'v-neck';
export type ShirtColor = 'white' | 'black';
export type Side = 'front' | 'back';
export interface ProductSelection { neckType: NeckType; color: ShirtColor; }

// editor.ts
export interface PrintArea { x: number; y: number; w: number; h: number; }
export interface DesignState {
  product: ProductSelection;
  front: object;          // Fabric JSON
  back: object;
  fontsUsed: string[];
  updatedAt: string;
}
export interface ContactInfo { name: string; phone: string; quantity: number; notes?: string; }
```
> 📘 BP §Revised Database Schema — ให้ type สอดคล้องกับ `designs.canvas_json` (migrate ไป Prisma ง่าย, task22)
**Acceptance:** type ครบ, `tsc --noEmit` ผ่าน, ไม่มี magic string ('crew' ตรงๆ) ที่อื่น
**Deliverable:** type layer พร้อม import

---

## task3 — Zustand Stores (Product + Editor)
**Goal:** state แยก domain
**Files:** `src/stores/useProductStore.ts`, `src/stores/useEditorStore.ts`
**Depends on:** task2
- `useProductStore`: `{ neckType, color, setNeckType, setColor }` default `crew`+`white`
- `useEditorStore`: `{ activeSide, frontJSON, backJSON, fontsUsed, addFont(), saveSide(side,json), getDesignState(), loadDesign(state), reset() }`
- ห้าม single global store · store ต้อง pure (ไม่แตะ Fabric/DOM)
**Acceptance:** set/get ได้, Vitest ≥2 เคส, `tsc` ผ่าน
**Deliverable:** stores ที่ test ผ่าน

---

## task4 — Shirt Templates Config + Mockup Assets
**Goal:** config mockup 4 แบบ + print area
**Files:** `src/lib/shirt-templates.ts`, `public/mockups/*`
**Depends on:** task2
- map `${neckType}-${color}` → `{ front, back, printArea }` ครบ 4 ชุด
- ยังไม่มีรูปจริง → placeholder SVG เสื้อ outline + โน้ตให้แทนทีหลัง
- `getTemplate(neckType, color, side)` helper
**Acceptance:** `getTemplate('crew','white','front')` คืน path+printArea ถูก, รูปโหลดได้
**Deliverable:** config + asset พร้อมใช้

---

# 🎨 GROUP B — Product Selection (task5)

## task5 — Product Selection Page
> 📘 BP §Product Catalog (MVP: running shirts)
**Goal:** หน้าแรกเลือกทรงคอ + สี → editor
**Files:** `src/app/page.tsx`, `src/components/product/ShirtPicker.tsx`
**Depends on:** task3, task4
- การ์ดทรงคอ (มี mockup) + swatch สี, selected state ชัด → update `useProductStore`
- ปุ่ม "เริ่มออกแบบ →" → `router.push('/editor')`, responsive, ใช้ design tokens
> หมายเหตุ: MVP-1 ใช้ template static; ต่อ API จริงใน task23
**Acceptance:** เลือกได้ + state ลง store + ไป `/editor` + responsive
**Deliverable:** หน้าแรกใช้งานได้

---

# 🖼️ GROUP C — Canvas Core (task6–9)

## task6 — Fabric.js Canvas Bootstrap
**Goal:** วาง canvas + mockup background ตาม product
**Files:** `src/app/editor/page.tsx`, `src/components/editor/EditorCanvas.tsx`, `src/lib/fabric-helpers.ts`
**Depends on:** task3, task4
- `editor/page.tsx` = `"use client"`; init `new Canvas(ref)` ใน `useEffect`, **dispose ตอน unmount**
- mockup background (non-selectable), responsive + รักษา aspect ratio
- ⚠️ Fabric v6 ESM: `import { Canvas, FabricImage } from 'fabric'`
**Acceptance:** เห็นเสื้อบน canvas, ไม่มี console error, ไม่ leak, เข้าตรงๆ fallback crew/white
**Deliverable:** canvas แสดงเสื้อได้

---

## task7 — Print Area Boundary + Object Clipping
**Goal:** จำกัด object ในกรอบพิมพ์
**Files:** `fabric-helpers.ts`, `EditorCanvas.tsx`
**Depends on:** task6
- วาดกรอบ print area (เส้นประจาง), จำกัดลากออกนอกกรอบ, helper `addToCanvas(obj)` place กลาง+scale พอดี
**Acceptance:** เห็นกรอบ, object ออกนอกกรอบไม่ได้
**Deliverable:** ระบบกรอบพิมพ์

---

## task8 — Object Manipulation (move/resize/rotate/delete)
**Goal:** แก้ object แบบ Canva
**Files:** `EditorCanvas.tsx`, `src/components/editor/LayerControls.tsx`
**Depends on:** task7
- selection handles, keyboard (`Delete`/arrow/`Cmd+D`), LayerControls (forward/back/duplicate/delete/lock)
- ⚠️ ไม่ลบ object ตอนกำลัง edit ข้อความ
**Acceptance:** move/resize/rotate/delete/layer ครบ (ไม่ลบตอนพิมพ์)
**Deliverable:** เครื่องมือแก้ไขครบ

---

## task9 — Layout Shell (Toolbar / Canvas / Right Panel)
**Goal:** โครง UI editor 3 ส่วน
**Files:** `editor/page.tsx`, `src/components/editor/Toolbar.tsx`
**Depends on:** task6
- left toolbar / center canvas / right panel (contextual ตาม object), mobile = bottom sheet
**Acceptance:** layout 3 ส่วนชัด, right panel ตาม selection, mobile ใช้ได้
**Deliverable:** editor shell

---

# ✍️ GROUP D — Text & Fonts (task10–12)

## task10 — Add & Edit Text
**Files:** `Toolbar.tsx`, `EditorCanvas.tsx`, `src/components/editor/TextPanel.tsx`
**Depends on:** task8, task9
- ปุ่ม "เพิ่มข้อความ" → `Textbox` กลางกรอบ; double-click edit; TextPanel: size/color/bold/italic/align (sync 2 ทาง)
**Acceptance:** เพิ่ม/แก้ได้, เปลี่ยน size/color/align เห็นผลทันที
**Deliverable:** text editing

## task11 — Google Fonts Loader
**Files:** `src/lib/google-fonts.ts`
**Depends on:** task1
- `loadGoogleFont(family)`: inject `<link>` + `await document.fonts.load()` (ไม่งั้น render ก่อนฟอนต์มา = fallback), cache กันซ้ำ
- curated ~30–50 ฟอนต์ รวม **ไทย: Kanit, Prompt, Sarabun, Noto Sans Thai, Mitr, Chakra Petch**
**Acceptance:** `loadGoogleFont('Kanit')` → `document.fonts.check('16px Kanit')`=true, ไม่ inject ซ้ำ
**Deliverable:** font loader

## task12 — Font Picker UI + Apply
**Files:** `src/components/editor/FontPicker.tsx`, `TextPanel.tsx`
**Depends on:** task10, task11
- dropdown → `await loadGoogleFont()` → `obj.set('fontFamily')` → `requestRenderAll()` → `addFont()`; loading state
**Acceptance:** เปลี่ยนฟอนต์ (รวมไทย) เห็นผลทันที, บันทึกใน `fontsUsed`
**Deliverable:** เปลี่ยนฟอนต์ได้ครบ

---

# 🖼️ GROUP E — Images & Sides (task13–15)

## task13 — Upload Image (PNG/JPG)
> 📘 BP §Security Checklist (File Upload)
**Files:** `Toolbar.tsx`, `fabric-helpers.ts`
**Depends on:** task7
- รับ `.png .jpg`, validate ≤20MB + **magic bytes** (ไม่เชื่อ extension), `FabricImage.fromURL` place+scale, error toast
**Acceptance:** อัปโหลดได้, ไฟล์ผิด/ใหญ่เกิน → reject+toast
**Deliverable:** image upload

## task14 — Upload & Render SVG
**Files:** `Toolbar.tsx`, `fabric-helpers.ts`
**Depends on:** task13
- `loadSVGFromString` → group, **sanitize** (กัน script injection), จัดการ SVG ไม่มี viewBox
**Acceptance:** SVG แสดงคมชัด+แก้ได้, SVG อันตรายถูก sanitize
**Deliverable:** SVG support

## task15 — Front/Back Toggle + Color/Neck Switch
**Files:** `editor/page.tsx`, `Toolbar.tsx`, `useEditorStore.ts`
**Depends on:** task6, task8
- toggle: `saveSide(current)` ก่อนสลับ → load อีกด้าน (2 JSON แยก); เปลี่ยนสี/ทรงคอ → เปลี่ยน background ทันที (object คงอยู่)
- ⚠️ restore ด้านต้อง re-load fonts ที่ใช้
**Acceptance:** สลับด้าน design คงอยู่, เปลี่ยนสี/ทรงคอ preview สด object ไม่หาย
**Deliverable:** multi-side + variant switching

---

# 💾 GROUP F — Persist & Submit (task16–18)

## task16 — Save / Load Design (localStorage)
**Files:** `useEditorStore.ts`, `src/lib/design-storage.ts`
**Depends on:** task15, task11
- save `getDesignState()` → localStorage; load restore 2 ด้าน + **re-load ทุกฟอนต์ก่อน `renderAll`**
- schema ตรงกับ `designs.canvas_json` (📘 BP §Schema) → migrate ไป DB ง่าย (task24)
**Acceptance:** reload หน้า design กลับมาเหมือนเดิม (ฟอนต์ถูก), JSON match schema
**Deliverable:** persistence ข้าม reload

## task17 — Export Preview PNG
**Files:** `fabric-helpers.ts`, `Toolbar.tsx`
**Depends on:** task15
- `exportSide(side)`: `toDataURL({format:'png', multiplier:2})` ทั้ง front+back โดยไม่รบกวน view, ปุ่ม download
**Acceptance:** PNG 2 ด้านคมชัด (รวม background), export แล้ว canvas เหมือนเดิม
**Deliverable:** export — input ของ task18

## task18 — Submit Design to Admin (API Route + Resend)
> 📘 BP §Email/Notification, §Security
**Files:** `src/app/api/submit-design/route.ts`, `src/components/editor/SubmitDialog.tsx`, `src/lib/admin-config.ts`, `.env.local`
**Depends on:** task17
- `SubmitDialog`: ชื่อ/เบอร์/จำนวน/หมายเหตุ + validate เบอร์ไทย `/^0[0-9]{9}$/`
- กดส่ง → export front+back PNG → POST `/api/submit-design`
- API (server): validate ด้วย **Zod**, จำกัดขนาดรูป, ส่ง Resend ไป `process.env.ADMIN_EMAIL` (=`sirichai.basz@gmail.com`, อยู่ใน env ไม่ hardcode)
- `RESEND_API_KEY` ฝั่ง server เท่านั้น; dev ใช้ `from: onboarding@resend.dev`
- loading + toast, กันกดซ้ำ
**Acceptance:** admin ได้อีเมลแนบ front/back + ข้อมูลครบ, เบอร์ผิด block, key ไม่ leak client, กันส่งซ้ำ
**Deliverable:** end-to-end ส่งแบบเข้าอีเมลได้จริง

---

# ✅ GROUP G — Polish & QA (task19–20)

## task19 — Responsive Polish + Empty/Error/Loading States
**Files:** ทุก component ที่เกี่ยวข้อง · **Depends on:** task5–18
- mobile editor ใช้ได้จริง (bottom sheet, pinch-zoom), empty/loading/error states, focus/keyboard a11y, design tokens สม่ำเสมอ
**Acceptance:** ลื่นทั้ง mobile+desktop, async ทุกอันมี feedback, Lighthouse ≥90
**Deliverable:** UX สมบูรณ์

## task20 — E2E Smoke Test + README + Cleanup
**Files:** `tests/e2e/*.spec.ts` (Playwright), `README.md` · **Depends on:** task1–19
- E2E: เลือกเสื้อ → เพิ่มข้อความ+ฟอนต์ → upload → สลับด้าน → ส่งฟอร์ม (mock API)
- README setup/env, ลบ dead code, `build`/`tsc`/lint สะอาด
**Acceptance:** E2E happy path ผ่าน, setup จากศูนย์ได้, ไม่มี warning ค้าง
**Deliverable:** **MVP-1 ส่งมอบได้จริง** ✅

---

# 🗄️ GROUP H — Backend Foundation (task21–22)

> 📘 BP §Database, §Revised Database Schema · stack: Next.js Route Handlers + Prisma + PostgreSQL

## task21 — Prisma + PostgreSQL Setup
**Goal:** ต่อ DB ได้ + migration workflow
**Files:** `prisma/schema.prisma`, `src/lib/db.ts`, `.env`
**Depends on:** task1
- `npm i prisma @prisma/client` + `npx prisma init`; PostgreSQL (local Docker `postgres:16` หรือ Neon/Railway)
- `src/lib/db.ts`: singleton `PrismaClient` (กัน hot-reload สร้างซ้ำ)
- npm scripts: `db:migrate`, `db:studio`, `db:seed`
- `DATABASE_URL` ใน `.env` (ไม่ commit)
**Acceptance:** `prisma migrate dev` สร้าง DB ได้, client connect, query ว่างผ่าน, `tsc` ผ่าน
**Deliverable:** DB layer พร้อม

## task22 — Prisma Schema = Domain Model
**Goal:** schema ตรงกับ blueprint
**Files:** `prisma/schema.prisma`, migration
**Depends on:** task21, task2
- models ตาม 📘 BP §Schema: `User, Product, PricingRule, Design, Order, OrderItem, Payment`
- enums: role/orderStatus/paymentStatus/printTechnique; `canvasJson Json`; indexes (user_id, status, created_at)
- ให้สอดคล้องกับ `src/types` (task2) — design.canvasJson = DesignState
**Acceptance:** migrate สร้างครบทุก table + FK + index, generated client typed, `tsc` ผ่าน
**Deliverable:** DB schema ครบ

---

# 📦 GROUP I — Products & Designs Persistence (task23–24)

## task23 — Products API + Seed
> 📘 BP §Products API, §Product Catalog
**Goal:** product มาจาก DB จริง
**Files:** `src/app/api/v1/products/route.ts`, `[id]/route.ts`, `prisma/seed.ts`
**Depends on:** task22, task5
- `GET /products` (list), `GET /products/{id}` (detail+colors); seed 3–5 running shirts (สี ≤6, base_cost)
- frontend `ShirtPicker` (task5) อ่านจาก API แทน static (มี loading/error)
**Acceptance:** list/detail คืนข้อมูล seed, หน้าเลือกเสื้อแสดงจาก DB
**Deliverable:** product catalog จริง

## task24 — Designs Persistence (เลิกพึ่ง localStorage)
> 📘 BP §Designs API
**Goal:** บันทึก/โหลด design ลง DB (รองรับ reorder)
**Files:** `src/app/api/v1/designs/route.ts`, `[id]/route.ts`, `mine/route.ts`, `useEditorStore.ts`, `design-storage.ts`
**Depends on:** task22, task16 · (ownership ต้องมี auth task28 — ก่อนหน้าใช้ guest)
- `POST /designs` save `canvasJson + fontsUsed + product`; `GET/PUT /designs/{id}`; `GET /designs/mine`
- เปลี่ยน save path ของ task16: authed → DB, guest → localStorage (fallback)
- load ต้อง re-load fonts ก่อน render
**Acceptance:** save → row ใน DB, โหลดจาก DB restore ถูก (ฟอนต์ครบ), JSON match schema
**Deliverable:** design persistence จริง

---

# 💰 GROUP J — Pricing (task25)

## task25 — Pricing Engine + Realtime Panel  🟡 เริ่มแล้วบางส่วน
> 📘 BP §Real-time Pricing Engine, §Pricing Logic, §Pricing API (port Python → TS)
**Goal:** คำนวณราคา realtime
**Files:** `src/lib/pricing.ts`, `src/app/api/v1/pricing/calculate/route.ts`, `src/components/editor/PricingPanel.tsx`
**Depends on:** task22, task9
- [x] **`src/lib/pricing.ts`** — config แก้ง่าย (`PRICING_CONFIG`) + `calculatePrice()` pure: size, จำนวนสี, หน้า/หลัง, ขนาดสกรีน, ส่วนลดจำนวน, งานด่วน, production days ✅ (commit `37fd2bd`)
- [ ] ย้ายเรตจาก config → `PricingRule` ใน DB (task22) แต่คง logic เดิม
- [ ] Zod schema share FE/BE; endpoint `/pricing/calculate` **public**
- [ ] frontend `PricingPanel`: React Query (`staleTime` 5 นาที) + debounce, แสดงราคาทันที
- [ ] 🔒 rate limit 100/min/IP (📘 BP §Security)
- [ ] Vitest ครอบ `calculatePrice` หลายเคส
**Acceptance:** Vitest คำนวณถูกหลายเคส, panel อัปเดต realtime, response <200ms
**Deliverable:** pricing ใช้งานได้

---

# 🛒 GROUP K — Orders, Checkout & Payment (task26–27)

## task26 — Orders API + Checkout Flow
> 📘 BP §Orders API, §Checkout Flow, §Reorder System
**Goal:** สร้าง order จาก design + pricing
**Files:** `src/app/api/v1/orders/route.ts`, `[id]/route.ts`, `[id]/reorder/route.ts`, `src/app/checkout/page.tsx`, `CheckoutForm.tsx`
**Depends on:** task24, task25
- `POST /orders` (design+pricing+contact+size_breakdown S/M/L/XL), gen `order_number` (ORD-YYYY-####); `GET /orders/mine`, `GET /orders/{id}`; `POST /orders/{id}/reorder` clone design เป็น draft
- checkout: RHF + Zod (เบอร์ไทย, ที่อยู่, event date, size breakdown)
- 🔒 rate limit 10 orders/hr/user
- 📧 ส่ง **order confirmation email → ลูกค้า** (Resend, Next `after()`) ทันทีหลังสร้าง order
**Acceptance:** create order persist order+items, list/detail, reorder ได้ draft แก้ไขได้, ลูกค้าได้ confirmation email
**Deliverable:** order + checkout จริง

## task27 — Payment: PromptPay + Slip Upload
> 📘 BP §Payments API, §Payment (MVP), §Security (File Upload)
**Goal:** รับชำระเงิน
**Files:** `src/app/api/v1/payments/[orderId]/upload-slip/route.ts`, `status/route.ts`, components
**Depends on:** task26, task31 (R2 — ถ้ายังไม่ทำ เก็บ temp ก่อน)
- gen PromptPay QR จาก total; upload slip (magic bytes, ≤5MB) → R2/temp; status `pending→reviewing→approved/rejected`
**Acceptance:** QR render, slip validate ถูก, status อ่านได้
**Deliverable:** payment flow

---

# 👤 GROUP L — Auth (task28)

## task28 — Auth (Clerk)
> 📘 BP §Authentication (มีตัวอย่าง `middleware.ts`)
**Goal:** login + ownership + role
**Files:** `src/middleware.ts`, `app/sign-in`, `app/sign-up`, `app/api/webhooks/clerk/route.ts`
**Depends on:** task22
- Clerk email/password + Google; protect `/dashboard`, `/admin` (role จาก metadata)
- webhook upsert `User` ลง DB; ผูก designs/orders กับ user
- ⚠️ ทุก protected API เช็ค ownership (`resource.userId === currentUser.id`)
**Acceptance:** protected route redirect, webhook สร้าง User, ownership enforce ใน API
**Deliverable:** auth ใช้งานได้

---

# 📊 GROUP M — Dashboards (task29–30)

## task29 — Customer Dashboard + Reorder
> 📘 BP §Order Dashboard, §Reorder System
**Files:** `src/app/dashboard/page.tsx`, order detail, timeline
**Depends on:** task26, task28
- list orders + status timeline + preview + invoice link; ปุ่ม Reorder → editor พร้อม design (loadFromJSON)
**Acceptance:** เห็น orders+status, reorder โหลด design กลับ editor
**Deliverable:** customer dashboard

## task30 — Admin Dashboard
> 📘 BP §Admin API, §Admin Dashboard
**Files:** `src/app/admin/*`, `src/app/api/v1/admin/*`
**Depends on:** task26, task27, task28
- order table (filter/search/paginate), update status, approve/reject payment, download artwork (presigned), production export (PDF/CSV)
**Acceptance:** admin-only, update status, approve payment, export โหลดได้
**Deliverable:** admin dashboard

---

# ☁️ GROUP N — Storage (task31)

## task31 — Cloudflare R2 + Presigned URLs
> 📘 BP §Storage
**Goal:** เก็บไฟล์จริง (designs/slips/exports)
**Files:** `src/lib/r2.ts`, wire designs/slips/exports
**Depends on:** task21
- S3 client → R2, bucket structure ตาม blueprint; **private + presigned URL เท่านั้น** (ห้าม expose bucket)
- แทน base64 email attachment (task18) ด้วย preview URL ที่เก็บไว้
**Acceptance:** upload คืน key, presigned GET ได้, ไม่มี public bucket
**Deliverable:** storage layer

---

# 🧾 GROUP O — Notifications & Invoice (task32)

## task32 — Invoice PDF + Customer Status Notifications
> 📘 BP §Order Dashboard (invoice download), §Email/Notification
**Goal:** ลูกค้าได้ใบแจ้งหนี้ + รู้ความคืบหน้า order
**Files:** `src/lib/invoice.ts`, `src/app/api/v1/orders/[id]/invoice/route.ts`, `src/lib/notifications.ts`
**Depends on:** task26, task27, task30
- gen **invoice PDF** จาก order (เลขที่/รายการ/total) — ใช้ lib เบาๆ (เช่น `@react-pdf/renderer` หรือ pdf-lib), ดาวน์โหลดจาก dashboard (task29)
- **status notification → ลูกค้า**: เมื่อ payment approved / order shipped → ส่ง email (Resend) + tracking number
- LINE Notify (admin) สำหรับ new order / payment received (📘 BP — customer LINE = Deferred)
**Acceptance:** ดาวน์โหลด invoice PDF ถูกต้อง, payment approved/shipped → ลูกค้าได้อีเมล, unit test generator
**Deliverable:** invoice + notification ครบ

---

# 🛬 GROUP P — Landing Page (task33, post-MVP)

## task33 — Landing Page
> 📘 BP §Landing Page · **เริ่มได้หลัง MVP-1 ส่งมอบ (task20)** — ไม่ block flow หลัก
**Goal:** หน้าขายก่อนเข้า editor
**Files:** `src/app/(marketing)/page.tsx` หรือย้าย product selection ไป `/design`
**Depends on:** task5
- sections: Hero (CTA + mockup + "ออกแบบและรู้ราคาทันที") · How It Works (4 ขั้น) · FAQ (delivery/min order/payment) · CTA
- responsive, design tokens, SEO meta (Next metadata)
**Acceptance:** หน้า landing แสดงครบทุก section, CTA → product selection, Lighthouse ≥90
**Deliverable:** landing page

---

# 🔒 Security Gate (📘 BP §Security Checklist — ตรวจก่อน go-live)

ทำเป็น acceptance ของ task ที่เกี่ยว ไม่ใช่ task แยก:
- Rate limit: pricing (100/min/IP, task25), order create (10/hr/user, task26)
- ทุก protected endpoint validate Clerk JWT + ownership — task28
- File: magic bytes, size limit, presigned only — task13/27/31
- Sanitize text input, ไม่ log เบอร์/ที่อยู่, HTTPS only — cross-cutting

---

# ⛔ Deferred — ห้ามทำจนกว่าจะมี trigger (กัน over-engineer)

| ของ | blueprint อยากได้ | ทำเมื่อ |
|-----|------------------|--------|
| Celery + Redis queue | บังคับ | ใช้ Next `after()`/bg ไปก่อน — ทำ queue เมื่อ email/export block request หรือ volume สูงจริง |
| Redis cache (pricing) | มี | เริ่มด้วย React Query + HTTP cache — เพิ่ม Redis เมื่อวัดแล้ว >200ms |
| LINE Messaging API | phase 2 | MVP ใช้ LINE Notify (admin alert) พอ |
| Multi-factory / Creator storefront / White-label SaaS | §Long-term | นอก scope — อย่าแตะ |
| Embroidery, advanced typography, AI image gen, collaboration | — | นอก scope |

---

# 📋 Dependency Map

```
MVP-1 (frontend):
task1 ─┬─ task2 ─ task3 ─┬─ task5
       │         task4 ──┘
       ├─ task6 ─ task7 ─ task8 ─ task9
       │   └─ task15 ─ task16 ─ task17 ─ task18
       ├─ task10 ─ task13 ─ task14
       └─ task11 ─ task12
   task19 (รวมทุกอย่าง) ─ task20  ← MVP-1 ส่งมอบ

Full-stack:
task21 ─ task22 ─┬─ task23
                 ├─ task24 (← task16)
                 ├─ task25 ─┬─ task26 ─ task27 (← task31)
                 │          └─ task29 (← task28)
                 └─ task31
task28 (auth) ─ task29, task30
task26,27,30 ─ task32 (invoice/notify)
task5 ─ task33 (landing, post-MVP)
```

**ลำดับ build ปลอดภัย:** 1→20 (MVP-1) → 21→22 (DB) → 23→24 (persist) → 25 (pricing) → 28 (auth) → 26→27 (order/pay) → 31 (storage) → 29→30 (dashboards) → 32 (invoice/notify) → 33 (landing)
