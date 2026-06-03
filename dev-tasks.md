# DEV TASKS — Custom Merch Platform MVP-1

> **วิธีใช้:** สั่ง `dev task1`, `dev task2` … ทีละอัน AI ทำเฉพาะ task นั้นจนจบแล้วส่งมอบ
> **อ้างอิง:** `task.md` (build plan) + `custom_merch_platform_blueprint_v2.md`
> **กติกาทุก task:**
> - แต่ละ task มี **Deliverable** ที่ทำงานได้จริง (รัน/เห็นผลได้) ไม่ใช่โค้ดครึ่งๆ
> - ทำตาม **Files**, **Depends on**, **Acceptance** ที่ระบุ
> - TypeScript strict, ไม่มี `any`, ไม่ทิ้ง TODO ที่ทำให้ feature พัง
> - หลังทำเสร็จ: commit ด้วยข้อความ `taskN: <สรุป>` และระบุว่าทดสอบยังไง
> - ถ้า task ไหนต้องการ asset (รูป mockup) ที่ยังไม่มี → ใช้ placeholder ที่ระบุ และโน้ตไว้

---

## MVP-1 Scope (ย้ำ)
เลือกแบบเสื้อ (คอกลม/คอวี · ขาว/ดำ) → Canvas Editor แบบ Canva (text + Google Fonts, upload SVG/image, edit เต็มที่, front/back, เปลี่ยนสี) → ส่งแบบเข้าอีเมล admin

**ลำดับแนะนำ:** task1 → task20 ตามลำดับ (มี dependency)

---

# 🏗️ GROUP A — Foundation (task1–4)

## task1 — Project Scaffold + Tooling
**Goal:** ตั้งโปรเจกต์ Next.js 15 ให้รันได้ พร้อม strict TS + Tailwind v4 + shadcn

**Files:**
- `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**รายละเอียด (Senior view):**
- `create-next-app` (App Router, TS, Tailwind, ESLint, src dir)
- `tsconfig`: เปิด `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- ติดตั้ง shadcn (`npx shadcn@latest init`) + เพิ่ม `button`, `dialog`, `input`, `select`, `label`, `sonner` (toast)
- ใส่ design tokens ใน `globals.css` (`--color-primary/accent/surface`, `--radius-base`)
- ตั้ง path alias `@/*`
- `app/page.tsx` แสดง placeholder "Merch Platform" ชั่วคราว

**Acceptance:**
- [ ] `npm run dev` รันได้ ไม่มี error, เปิด `localhost:3000` เห็นหน้า
- [ ] `npm run build` ผ่าน
- [ ] `npx tsc --noEmit` ผ่าน (ไม่มี type error)

**Deliverable:** repo ที่ clone แล้ว `npm i && npm run dev` ใช้ได้ทันที

---

## task2 — Type Definitions + Domain Models
**Goal:** นิยาม type กลางทั้งหมดที่ทุก feature ใช้ร่วมกัน (single source of truth)

**Files:** `src/types/editor.ts`, `src/types/product.ts`

**รายละเอียด:**
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
export interface ContactInfo {
  name: string; phone: string; quantity: number; notes?: string;
}
```
- ใช้ `Side`, `NeckType` ฯลฯ ทุกที่ ห้าม magic string

**Acceptance:**
- [ ] type ครบตาม blueprint, `tsc --noEmit` ผ่าน
- [ ] ไม่มีไฟล์อื่น import string literal ('crew' ตรงๆ) — ใช้ type แทน

**Deliverable:** type layer พร้อมให้ task ถัดไป import

---

## task3 — Zustand Stores (Product + Editor)
**Goal:** state management แยก domain

**Files:** `src/stores/useProductStore.ts`, `src/stores/useEditorStore.ts`
**Depends on:** task2

**รายละเอียด:**
- `useProductStore`: `{ neckType, color, setNeckType, setColor }` default `crew` + `white`
- `useEditorStore`: `{ activeSide, frontJSON, backJSON, fontsUsed, addFont(), saveSide(side, json), getDesignState(), loadDesign(state), reset() }`
- ห้าม single global store (แยกตาม blueprint)
- เขียนให้ pure — ไม่แตะ Fabric/DOM ใน store

**Acceptance:**
- [ ] import store ใน component ได้, set/get ค่าได้
- [ ] เขียน unit test เล็กๆ (Vitest) ทดสอบ setQuantity/saveSide อย่างน้อย 2 เคส
- [ ] `tsc --noEmit` ผ่าน

**Deliverable:** stores ที่ test ผ่าน

---

## task4 — Shirt Templates Config + Mockup Assets
**Goal:** config mockup เสื้อ 4 แบบ + print area

**Files:** `src/lib/shirt-templates.ts`, `public/mockups/*.png`
**Depends on:** task2

**รายละเอียด:**
- map `${neckType}-${color}` → `{ front, back, printArea }` ครบ 4 ชุด (crew-white/black, v-neck-white/black)
- ถ้ายังไม่มีรูปจริง: สร้าง placeholder PNG (เสื้อ outline เรียบๆ พื้นโปร่งใส) หรือ SVG ชั่วคราว + โน้ตว่าให้แทนที่ด้วย asset จริง
- `getTemplate(neckType, color, side)` helper

**Acceptance:**
- [ ] เรียก `getTemplate('crew','white','front')` ได้ path + printArea ถูกต้อง
- [ ] รูป (หรือ placeholder) โหลดได้จาก `/mockups/...`

**Deliverable:** config + asset พร้อมใช้ใน editor

---

# 🎨 GROUP B — Product Selection (task5)

## task5 — Product Selection Page
**Goal:** หน้าแรกเลือกทรงคอ + สี แล้วไป editor

**Files:** `src/app/page.tsx`, `src/components/product/ShirtPicker.tsx`
**Depends on:** task3, task4

**รายละเอียด (Senior view):**
- เลือกทรงคอ (คอกลม/คอวี) เป็นการ์ดมีรูป mockup, สี (ขาว/ดำ) เป็น swatch
- selected state ชัด (border accent), update `useProductStore`
- ปุ่ม "เริ่มออกแบบ →" → `router.push('/editor')`
- responsive (mobile stack, desktop grid)
- ใช้ shadcn + design tokens

**Acceptance:**
- [ ] เลือกทรง+สีได้ เห็น selection ชัด
- [ ] state ถูกบันทึกใน store (เช็คด้วย devtools)
- [ ] กดปุ่มไป `/editor` ได้
- [ ] ดูดีทั้ง mobile + desktop

**Deliverable:** หน้าแรกใช้งานได้จริง

---

# 🖼️ GROUP C — Canvas Core (task6–9)

## task6 — Fabric.js Canvas Bootstrap
**Goal:** วาง canvas + mockup เป็น background ตาม product

**Files:** `src/app/editor/page.tsx`, `src/components/editor/EditorCanvas.tsx`, `src/lib/fabric-helpers.ts`
**Depends on:** task3, task4

**รายละเอียด:**
- `editor/page.tsx` = `"use client"`
- init `new Canvas(ref)` ใน `useEffect`, **dispose ตอน unmount** (กัน memory leak)
- โหลด mockup ตาม `useProductStore` เป็น background (non-selectable, non-evented)
- กำหนด canvas size responsive, รักษา aspect ratio
- ⚠️ Fabric v6 ESM import: `import { Canvas, FabricImage } from 'fabric'`

**Acceptance:**
- [ ] เปิด `/editor` เห็นเสื้อ mockup บน canvas
- [ ] ไม่มี console error, unmount แล้วไม่ leak (เปลี่ยนหน้าไปกลับได้)
- [ ] ถ้าเข้าตรงๆ โดยไม่เลือก product → fallback default (crew/white)

**Deliverable:** canvas ที่แสดงเสื้อได้

---

## task7 — Print Area Boundary + Object Clipping
**Goal:** จำกัดให้ object อยู่ในกรอบพิมพ์

**Files:** `src/lib/fabric-helpers.ts`, `EditorCanvas.tsx`
**Depends on:** task6

**รายละเอียด:**
- วาดกรอบ print area (เส้นประจางๆ) ตาม `printArea` จาก template
- จำกัด object ไม่ให้ลากออกนอกกรอบ (clip path หรือ `object:moving` handler)
- helper `addToCanvas(obj)` ที่ place object กลางกรอบ + scale พอดี

**Acceptance:**
- [ ] เห็นกรอบพิมพ์บนเสื้อ
- [ ] ลาก object ออกนอกกรอบไม่ได้ (หรือถูก clip)

**Deliverable:** ระบบกรอบพิมพ์ทำงาน

---

## task8 — Object Manipulation (move/resize/rotate/delete)
**Goal:** แก้ไข object แบบ Canva

**Files:** `EditorCanvas.tsx`, `src/components/editor/LayerControls.tsx`
**Depends on:** task7

**รายละเอียด:**
- selection handles (Fabric built-in): resize มุม, rotate handle
- keyboard: `Delete`/`Backspace` ลบ, arrow keys ขยับ, `Ctrl/Cmd+D` duplicate
- `LayerControls`: bring forward / send backward / duplicate / delete / lock
- handle เฉพาะตอนมี active object (ไม่ลบตอนพิมพ์ข้อความ — ระวัง edit mode)

**Acceptance:**
- [ ] move/resize/rotate ด้วยเมาส์ได้
- [ ] Delete ลบ object ได้ (แต่ไม่ลบตอนกำลังแก้ข้อความ)
- [ ] layer order เปลี่ยนได้

**Deliverable:** ครบเครื่องมือแก้ไข object

---

## task9 — Layout Shell (Toolbar / Canvas / Right Panel)
**Goal:** โครง UI editor 3 ส่วนแบบ Canva

**Files:** `editor/page.tsx`, `src/components/editor/Toolbar.tsx`
**Depends on:** task6

**รายละเอียด:**
- left toolbar (เพิ่ม text/upload), center canvas, right panel (contextual properties)
- right panel เปลี่ยนตาม object ที่เลือก (ว่าง / text / image)
- responsive: mobile = canvas เต็มจอ + bottom sheet สำหรับ tools
- ใช้ design tokens, micro-interactions ลื่น

**Acceptance:**
- [ ] เห็น layout 3 ส่วนชัดบน desktop
- [ ] right panel ตอบสนองตาม selection
- [ ] mobile ใช้งานได้ (อย่างน้อยดู+เลือก object)

**Deliverable:** editor shell พร้อมเสียบ feature

---

# ✍️ GROUP D — Text & Fonts (task10–12)

## task10 — Add & Edit Text
**Goal:** เพิ่ม/แก้ข้อความบนเสื้อ

**Files:** `Toolbar.tsx`, `EditorCanvas.tsx`, `src/components/editor/TextPanel.tsx`
**Depends on:** task8, task9

**รายละเอียด:**
- ปุ่ม "เพิ่มข้อความ" → `Textbox('แตะเพื่อแก้ไข')` กลางกรอบ
- double-click = inline edit
- `TextPanel`: size, color, bold/italic, align
- sync ค่ากับ object ที่เลือก (สองทาง)

**Acceptance:**
- [ ] เพิ่มข้อความได้, double-click แก้ได้
- [ ] เปลี่ยน size/color/align เห็นผลทันที

**Deliverable:** text editing ใช้งานได้

---

## task11 — Google Fonts Loader
**Goal:** โหลด Google Font แบบ dynamic + รอโหลดเสร็จก่อน apply

**Files:** `src/lib/google-fonts.ts`
**Depends on:** task1

**รายละเอียด:**
- `loadGoogleFont(family)`: inject `<link>` + `await document.fonts.load(...)` (สำคัญ — ไม่งั้น render ก่อนฟอนต์มาถึง = fallback)
- กันโหลดซ้ำ (cache set ของ family ที่โหลดแล้ว)
- curated list ~30–50 ฟอนต์ รวม **ไทย: Kanit, Prompt, Sarabun, Noto Sans Thai, Mitr, Chakra Petch**

**Acceptance:**
- [ ] เรียก `loadGoogleFont('Kanit')` แล้ว `document.fonts.check('16px Kanit')` = true
- [ ] โหลดซ้ำ family เดิมไม่ inject link ซ้ำ

**Deliverable:** font loader พร้อมใช้

---

## task12 — Font Picker UI + Apply to Text
**Goal:** เลือกฟอนต์จาก dropdown แล้ว apply กับ text object

**Files:** `src/components/editor/FontPicker.tsx`, `TextPanel.tsx`
**Depends on:** task10, task11

**รายละเอียด:**
- dropdown แสดงชื่อฟอนต์ (ถ้าทำได้ preview ด้วยฟอนต์จริง)
- เลือก → `await loadGoogleFont()` → `obj.set('fontFamily', family)` → `requestRenderAll()` → `useEditorStore.addFont(family)`
- โชว์ loading ระหว่างโหลดฟอนต์

**Acceptance:**
- [ ] เปลี่ยนฟอนต์ (รวมไทย) เห็นผลบน canvas ทันที
- [ ] family ถูกบันทึกใน `fontsUsed`

**Deliverable:** เปลี่ยนฟอนต์ได้ครบ

---

# 🖼️ GROUP E — Images & Sides (task13–15)

## task13 — Upload Image (PNG/JPG)
**Goal:** อัปโหลดรูปวางบนเสื้อ

**Files:** `Toolbar.tsx`, `src/lib/fabric-helpers.ts`
**Depends on:** task7

**รายละเอียด:**
- input รับ `.png .jpg`, validate ≤ 20MB + **magic bytes** (ไม่เชื่อ extension อย่างเดียว — security)
- `FabricImage.fromURL` → place กลางกรอบ, scale พอดี
- error toast ถ้าไฟล์ผิด/ใหญ่เกิน

**Acceptance:**
- [ ] อัปโหลด PNG/JPG วางบนเสื้อได้
- [ ] ไฟล์ผิดประเภท/ใหญ่เกิน → reject พร้อม toast

**Deliverable:** image upload ใช้งานได้

---

## task14 — Upload & Render SVG
**Goal:** รองรับ SVG (vector คมชัด)

**Files:** `Toolbar.tsx`, `fabric-helpers.ts`
**Depends on:** task13

**รายละเอียด:**
- `loadSVGFromString` → group เป็น object เดียว → place + scale
- sanitize SVG (กัน script injection)
- จัดการ SVG ที่ไม่มี viewBox / ขนาดแปลก

**Acceptance:**
- [ ] อัปโหลด SVG แล้วแสดงคมชัด แก้ไข (resize/rotate) ได้
- [ ] SVG อันตราย (มี script) ถูก sanitize

**Deliverable:** SVG support

---

## task15 — Front/Back Toggle + Shirt Color/Neck Switch
**Goal:** สลับด้าน + เปลี่ยนสี/ทรงคอ โดยไม่หาย design

**Files:** `editor/page.tsx`, `Toolbar.tsx`, `useEditorStore.ts`
**Depends on:** task6, task8

**รายละเอียด:**
- toggle front/back: `saveSide(current)` ก่อนสลับ แล้ว load อีกด้าน (เก็บ 2 JSON แยก)
- เปลี่ยนสีเสื้อ (ขาว/ดำ) → เปลี่ยน background mockup ทันที (object คงอยู่)
- เปลี่ยนทรงคอ → เปลี่ยน mockup ตาม
- ⚠️ ตอน restore ด้านต้อง re-load fonts ที่ใช้

**Acceptance:**
- [ ] สลับ front/back แล้ว design แต่ละด้านคงอยู่
- [ ] เปลี่ยนสี/ทรงคอ preview สดทันที object ไม่หาย

**Deliverable:** multi-side + variant switching

---

# 💾 GROUP F — Persist & Submit (task16–18)

## task16 — Save / Load Design (localStorage)
**Goal:** บันทึก + กู้คืน design (เตรียม reorder ในอนาคต)

**Files:** `useEditorStore.ts`, `src/lib/design-storage.ts`
**Depends on:** task15, task11

**รายละเอียด:**
- save: `getDesignState()` (front+back JSON + product + fontsUsed) → localStorage
- load: restore ทั้งสองด้าน + **re-load ทุกฟอนต์ใน `fontsUsed` ก่อน `renderAll`** (ไม่งั้นฟอนต์ fallback)
- schema ตรงกับ `designs.canvas_json` ใน blueprint (migrate ไป DB ง่าย)

**Acceptance:**
- [ ] save แล้ว reload หน้า → design กลับมาเหมือนเดิม (ฟอนต์ถูกต้อง)
- [ ] JSON structure match blueprint

**Deliverable:** persistence ทำงานข้าม reload

---

## task17 — Export Preview PNG
**Goal:** export รูป preview front/back ความละเอียดสูง

**Files:** `src/lib/fabric-helpers.ts`, `Toolbar.tsx`
**Depends on:** task15

**รายละเอียด:**
- `exportSide(side)`: switch ไปด้านนั้น → `toDataURL({format:'png', multiplier:2})`
- export ทั้ง front+back โดยไม่รบกวน view ปัจจุบัน (render off-screen หรือ save/restore active side)
- ปุ่ม download (สำหรับ user ดูเอง)

**Acceptance:**
- [ ] ได้ PNG ทั้ง 2 ด้าน คมชัด (รวม background เสื้อ)
- [ ] export แล้ว canvas กลับมาเหมือนเดิม

**Deliverable:** export ใช้งานได้ — เป็น input ของ task18

---

## task18 — Submit Design to Admin (API Route + Resend)
**Goal:** ส่งแบบ + ข้อมูลผู้สั่ง เข้าอีเมล admin

**Files:** `src/app/api/submit-design/route.ts`, `src/components/editor/SubmitDialog.tsx`, `src/lib/admin-config.ts`, `.env.local`
**Depends on:** task17

**รายละเอียด (Senior view):**
- `SubmitDialog`: ฟอร์ม ชื่อ/เบอร์/จำนวน/หมายเหตุ + validate เบอร์ไทย `/^0[0-9]{9}$/`
- กดส่ง → export front+back PNG → POST `/api/submit-design`
- API route (server): validate payload ด้วย zod, จำกัดขนาดรูป, ส่งด้วย Resend ไป `process.env.ADMIN_EMAIL`
- `ADMIN_EMAIL=sirichai.basz@gmail.com` อยู่ใน `.env.local` (ไม่ hardcode ในโค้ด)
- `RESEND_API_KEY` ฝั่ง server เท่านั้น
- ⚠️ dev ใช้ `from: onboarding@resend.dev`; production ต้อง verify domain
- loading + success/error toast, กันกดซ้ำ (disable ระหว่างส่ง)

**Acceptance:**
- [ ] กรอกฟอร์ม → admin (sirichai.basz@gmail.com) ได้อีเมลแนบ front/back PNG + ข้อมูลครบ
- [ ] เบอร์ผิด format → block ไม่ส่ง
- [ ] API key ไม่ leak ฝั่ง client (เช็ค network/bundle)
- [ ] ส่งซ้ำระหว่างรออยู่ไม่ได้

**Deliverable:** end-to-end ส่งแบบเข้าอีเมลได้จริง

---

# ✅ GROUP G — Polish & QA (task19–20)

## task19 — Responsive Polish + Empty/Error/Loading States
**Goal:** เก็บงาน UX ให้ production-ready

**Files:** ทุก component ที่เกี่ยวข้อง
**Depends on:** task5–18

**รายละเอียด:**
- mobile/tablet: editor ใช้งานได้จริง (toolbar เป็น bottom sheet, canvas pinch-zoom พอเหมาะ)
- empty state (ยังไม่มี object), loading (โหลดฟอนต์/ส่งอีเมล), error (อัปโหลด/ส่งล้มเหลว)
- micro-interactions, focus states, keyboard accessibility ขั้นพื้นฐาน
- ตรวจ design tokens สม่ำเสมอทั้งแอป

**Acceptance:**
- [ ] ใช้งานลื่นบน mobile + desktop ไม่มี layout แตก
- [ ] ทุก async action มี loading/error feedback
- [ ] Lighthouse (desktop) ≥ 90

**Deliverable:** UX สมบูรณ์

---

## task20 — E2E Smoke Test + README + Cleanup
**Goal:** การันตี flow หลัก + ส่งมอบโปรเจกต์

**Files:** `tests/e2e/*.spec.ts` (Playwright), `README.md`
**Depends on:** task1–19

**รายละเอียด:**
- Playwright E2E: เลือกเสื้อ → เพิ่มข้อความ+เปลี่ยนฟอนต์ → upload รูป → สลับด้าน → ส่งฟอร์ม (mock API)
- `README.md`: setup, env ที่ต้องตั้ง (`RESEND_API_KEY`, `ADMIN_EMAIL`), วิธีรัน, วิธีแทน mockup asset จริง
- ลบ dead code / console.log / unused deps
- ยืนยัน `npm run build` + `tsc --noEmit` + lint ผ่านสะอาด

**Acceptance:**
- [ ] E2E happy path ผ่าน
- [ ] README ทำตามแล้ว setup โปรเจกต์ได้จากศูนย์
- [ ] build/type/lint ผ่านหมด ไม่มี warning ค้าง

**Deliverable:** MVP-1 ส่งมอบได้จริง พร้อมต่อ Phase 2

---

# 📋 Dependency Map (สรุป)

```
task1 ─┬─ task2 ─ task3 ─┬─ task5 ─────────────┐
       │         task4 ──┘                     │
       │                                        │
       ├─ task6 ─ task7 ─ task8 ─ task9         │
       │   │                                    │
       │   └─ task15 ─ task16 ─ task17 ─ task18 │
       │                                        │
       ├─ task11 ─ task12 (ต้องมี task10 ก่อน)  │
       │                                        │
       └─ task10 ─ task13 ─ task14              │
                                                 │
   task19 (รวมทุกอย่าง) ─ task20 ───────────────┘
```

**ลำดับ build ที่ปลอดภัยที่สุด:** 1→2→3→4→5→6→7→8→9→10→11→12→13→14→15→16→17→18→19→20

---

# 🔧 Phase 2+ (นอก MVP-1 — อย่าเพิ่งทำ)
Auth (Clerk) · บันทึก design ลง PostgreSQL/R2 · Pricing engine (FastAPI) · Checkout/PromptPay · Order dashboard · **Reorder** (loadFromJSON) · Admin dashboard
