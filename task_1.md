# TASK.md — Custom Merch Platform (MVP-1 Build Plan)

> เอกสารนี้คือ **task list สำหรับให้ AI (เช่น Claude Code / Cursor) ใช้พัฒนาโปรเจกต์จริง**
> อ้างอิงจาก `custom_merch_platform_blueprint_v2.md`
> **ขอบเขต MVP-1:** เลือกแบบเสื้อ → เข้าสู่ Canvas Editor แบบ Canva (ใส่ข้อความด้วย Google Fonts, upload SVG/Image, edit ได้เต็มที่)

---

## 0. MVP-1 Scope (อ่านก่อนเริ่ม)

### สิ่งที่ต้อง build ใน MVP-1 (เท่านั้น)
1. **Product Selection** — เลือกแบบเสื้อ: คอกลม (crew) / คอวี (v-neck), สี ขาว / ดำ
2. **Canvas Editor (หัวใจหลัก)** — ใช้งานง่ายเหมือน canva.com:
   - ใส่ข้อความ + เลือก **Google Fonts** (เปลี่ยน font ได้ทุกตัว)
   - Upload **SVG / PNG / JPG**
   - Edit object: move / resize / rotate / delete / layer
   - Front / Back toggle
   - เปลี่ยนสีเสื้อแล้ว preview สดทันที
   - Save design (JSON) + export preview image
3. **Submit to Admin (ส่งแบบเสื้อเข้าอีเมล admin)** — ลูกค้ากดส่งแบบที่ออกแบบ → ส่งอีเมลแนบรูป preview (front/back) ไปหา admin

### ❌ ยังไม่ build ใน MVP-1
- Pricing engine, Checkout, Payment, Orders, Admin, Auth (Clerk), Backend DB
  *(เก็บไว้ phase ถัดไป — ดู section 8)*
- AI image generation, collaboration, advanced typography (kerning), smart snapping grid

> **เป้าหมาย MVP-1:** พิสูจน์ว่า "ออกแบบเสื้อบนเว็บได้ลื่นเหมือน Canva" ก่อน แล้วค่อยต่อ commerce layer

---

## 1. Tech Stack (MVP-1)

| ส่วน | เทคโนโลยี | หมายเหตุ |
|------|-----------|----------|
| Framework | Next.js 15 (App Router) | Editor page = `"use client"` |
| Language | TypeScript (strict) | `strict: true`, `noUncheckedIndexedAccess` |
| Styling | TailwindCSS v4 + design tokens | ตาม globals.css ใน blueprint |
| UI | shadcn/ui | base components เท่านั้น |
| Canvas | **Fabric.js v6** | object model + `toJSON()`/`loadFromJSON()` |
| State | Zustand | `useEditorStore`, `useProductStore` |
| Fonts | Google Fonts (dynamic loader) | โหลด font on-demand |
| Storage (MVP-1) | in-memory + `localStorage` ชั่วคราว | ⚠️ backend persistence ทีหลัง |
| Email | **Resend** ผ่าน Next.js API route | server-side, key อยู่ใน env (ไม่ leak) |

> **หมายเหตุ Fabric.js:** ใช้ v6 (`fabric` package ใหม่ ESM). ระวัง API ต่างจาก v5 (`import { Canvas, FabricText, FabricImage } from 'fabric'`).

---

## 2. Project Setup

- [ ] `npx create-next-app@latest merch-editor --typescript --tailwind --app --eslint`
- [ ] เปิด strict mode ใน `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- [ ] ติดตั้ง: `npm i fabric@^6 zustand resend` และ `npx shadcn@latest init`
- [ ] เพิ่ม design tokens ใน `globals.css`:
  ```css
  :root {
    --color-primary: #000000;
    --color-accent: #00f0ff;
    --color-surface: #f9f9f9;
    --radius-base: 0.5rem;
    --font-sans: 'Inter', sans-serif;
  }
  ```
- [ ] โครงสร้างโฟลเดอร์:
  ```
  src/
  ├── app/
  │   ├── page.tsx                  ← product selection
  │   ├── editor/page.tsx           ← canvas editor ("use client")
  │   └── api/
  │       └── submit-design/route.ts ← ส่งอีเมลไป admin (server-side)
  ├── components/
  │   ├── product/ShirtPicker.tsx
  │   └── editor/
  │       ├── EditorCanvas.tsx       ← Fabric.js wrapper
  │       ├── Toolbar.tsx            ← add text / upload / shapes
  │       ├── TextPanel.tsx          ← font / size / color
  │       ├── LayerControls.tsx      ← front/back, delete, z-index
  │       ├── FontPicker.tsx         ← Google Fonts dropdown
  │       └── SubmitDialog.tsx       ← ฟอร์มกรอกชื่อ/เบอร์ + ปุ่มส่งแบบ
  ├── stores/
  │   ├── useProductStore.ts
  │   └── useEditorStore.ts
  ├── lib/
  │   ├── fabric-helpers.ts
  │   ├── google-fonts.ts            ← font loader
  │   ├── shirt-templates.ts         ← mockup config
  │   └── admin-config.ts            ← ADMIN_EMAIL (อ่านจาก env)
  └── types/editor.ts
  ```
- [ ] เพิ่ม env: `.env.local` → `RESEND_API_KEY=re_...` และ `ADMIN_EMAIL=sirichai.basz@gmail.com`

---

## 3. Product Selection (หน้าแรก)

- [ ] `useProductStore`: เก็บ `{ neckType: 'crew' | 'v-neck', color: 'white' | 'black' }`
- [ ] `ShirtPicker.tsx`:
  - [ ] เลือกทรงคอ: คอกลม / คอวี (การ์ดมีรูป mockup)
  - [ ] เลือกสี: ขาว / ดำ (swatch กดได้)
  - [ ] ปุ่ม "เริ่มออกแบบ →" → `router.push('/editor')`
- [ ] `lib/shirt-templates.ts`: map แต่ละ (neckType × color) → path รูป mockup เปล่า (PNG พื้นหลังโปร่งใส) + พิกัด print area (front/back)
  ```ts
  export const SHIRT_TEMPLATES = {
    'crew-white': { front: '/mockups/crew-white-front.png', back: '...', printArea: { x: 150, y: 120, w: 300, h: 380 } },
    // crew-black, v-neck-white, v-neck-black ...
  }
  ```
- [ ] เตรียมรูป mockup เปล่า 4 ไฟล์ (หรือใช้ placeholder ก่อน)

---

## 4. Canvas Editor — งานหลัก ⭐

> เป้าหมาย UX: **เหมือน canva.com** — กดง่าย, drag ลื่น, เห็นผลทันที

### 4.1 Canvas พื้นฐาน
- [ ] `EditorCanvas.tsx`: init `new Canvas(ref)` ใน `useEffect`, dispose ตอน unmount
- [ ] วาง **รูป mockup เสื้อเป็น background** (ตาม product ที่เลือก) — ไม่ใช่ editable object
- [ ] กำหนด **print-area boundary** (กรอบที่ object ขยับได้) ตาม `printArea`
- [ ] Responsive canvas (รองรับ desktop + tablet; mobile ดู preview ได้)

### 4.2 Text + Google Fonts ⭐
- [ ] ปุ่ม "เพิ่มข้อความ" → สร้าง `FabricText('แตะเพื่อแก้ไข')` ตรงกลาง print area
- [ ] Double-click = edit inline (ใช้ `IText` / `Textbox` ของ Fabric)
- [ ] `lib/google-fonts.ts`: โหลด font จาก Google Fonts API แบบ dynamic
  ```ts
  export async function loadGoogleFont(family: string) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g,'+')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    await document.fonts.load(`16px "${family}"`); // รอ font โหลดเสร็จก่อน apply
  }
  ```
- [ ] `FontPicker.tsx`: dropdown รายการ Google Fonts (เริ่มจาก curated list ~30-50 ตัว เช่น Inter, Poppins, Bebas Neue, Anton, Kanit, Prompt, Sarabun, Noto Sans Thai)
  > ⚠️ **ต้องมีฟอนต์ภาษาไทย** (Kanit, Prompt, Sarabun, Noto Sans Thai) เพราะ target users คนไทย
- [ ] เลือก font → `loadGoogleFont()` → `obj.set('fontFamily', family); canvas.requestRenderAll()`
- [ ] `TextPanel.tsx` ควบคุม: font family, size, color, bold, italic, align
- [ ] ⚠️ **สำคัญ:** เมื่อ load design กลับมา ต้อง re-load Google Fonts ทุกตัวที่ใช้ ก่อน `renderAll` ไม่งั้น font จะ fallback

### 4.3 Upload SVG / Image ⭐
- [ ] ปุ่ม upload รับ `.svg .png .jpg` (validate ≤ 20MB)
- [ ] SVG: `loadSVGFromString()` → group เป็น object เดียว
- [ ] PNG/JPG: `FabricImage.fromURL()`
- [ ] วาง object ลงกลาง print area, scale ให้พอดี (ไม่เกินกรอบ)
- [ ] ⚠️ validate file type ด้วย magic bytes ไม่ใช่แค่ extension (security)

### 4.4 Edit Objects (เหมือน Canva)
- [ ] Selection handles: resize (มุม), rotate (handle บน) — Fabric มี built-in
- [ ] Keyboard: `Delete` ลบ, `Ctrl/Cmd+C/V` copy/paste, arrow keys ขยับ
- [ ] `LayerControls.tsx`: bring forward / send backward / delete / duplicate / lock
- [ ] Toolbar เปลี่ยน contextual ตาม object ที่เลือก (text → TextPanel, image → image controls)
- [ ] Snap-to-center guide แบบเบาๆ (optional, ไม่ต้องทำ grid ซับซ้อน)

### 4.5 Front / Back + เปลี่ยนสีเสื้อ
- [ ] Toggle Front/Back → เก็บ canvas state แยก 2 ชุด (`frontJSON`, `backJSON`) ใน `useEditorStore`
- [ ] เปลี่ยนสีเสื้อ (ขาว/ดำ) → เปลี่ยน background mockup ทันที (object ยังอยู่)
- [ ] เปลี่ยนทรงคอ → เปลี่ยน mockup ตาม

### 4.6 Save / Export
- [ ] Save: `canvas.toJSON(['id','name'])` ทั้ง front + back → เก็บใน store + `localStorage` (MVP-1)
- [ ] Export preview: `canvas.toDataURL({ format:'png', multiplier:2 })` → ดาวน์โหลดได้
- [ ] โครงสร้าง design state (ตรงกับ blueprint `designs.canvas_json` เพื่อ migrate ไป backend ง่าย):
  ```ts
  interface DesignState {
    product: { neckType: string; color: string };
    front: object;   // fabric JSON
    back: object;
    fontsUsed: string[];  // ⭐ เก็บรายการ font เพื่อ re-load ตอน reorder
  }
  ```

### 4.7 Submit to Admin — ส่งแบบเสื้อเข้าอีเมล ⭐
- [ ] ปุ่ม **"ส่งแบบให้ทีมงาน"** ใน editor → เปิด `SubmitDialog.tsx`
- [ ] ฟอร์มในไดอะล็อก (ขั้นต่ำ): ชื่อผู้สั่ง, เบอร์โทร, จำนวนคร่าวๆ, หมายเหตุ
  - [ ] validate เบอร์โทรไทย (`/^0[0-9]{9}$/`)
- [ ] เมื่อกดส่ง:
  1. export preview front + back เป็น PNG (`canvas.toDataURL`, multiplier 2)
  2. POST ไป `/api/submit-design` พร้อม `{ product, contact, frontPng, backPng, designJSON }`
  3. แสดง loading → success / error toast
- [ ] **API route** `app/api/submit-design/route.ts` (server-side):
  - [ ] รับ payload, แปลง base64 PNG → attachment
  - [ ] ส่งอีเมลด้วย Resend ไปหา `ADMIN_EMAIL`
  ```ts
  // app/api/submit-design/route.ts
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  export async function POST(req: Request) {
    const { product, contact, frontPng, backPng } = await req.json();
    // TODO: validate payload (zod) + จำกัดขนาดรูป
    await resend.emails.send({
      from: 'orders@yourplatform.com',          // ต้อง verify domain ใน Resend
      to: process.env.ADMIN_EMAIL!,             // ← sirichai.basz@gmail.com (ผ่าน env)
      subject: `แบบเสื้อใหม่ จาก ${contact.name} (${product.neckType}/${product.color})`,
      html: `<h2>แบบเสื้อใหม่</h2>
             <p>ชื่อ: ${contact.name}<br/>เบอร์: ${contact.phone}<br/>
             จำนวน: ${contact.quantity}<br/>ทรงคอ: ${product.neckType}<br/>
             สี: ${product.color}<br/>หมายเหตุ: ${contact.notes ?? '-'}</p>`,
      attachments: [
        { filename: 'front.png', content: frontPng.split(',')[1] }, // base64 ตัด prefix
        { filename: 'back.png',  content: backPng.split(',')[1] },
      ],
    });
    return Response.json({ ok: true });
  }
  ```
- [ ] `lib/admin-config.ts`: `export const ADMIN_EMAIL = process.env.ADMIN_EMAIL` — ห้าม hardcode ในหลายที่

> ⚠️ **เรื่อง hardcode email:** อีเมล admin คือ `sirichai.basz@gmail.com` สำหรับ MVP
> แต่ **เก็บใน env variable (`ADMIN_EMAIL`) ไม่ใช่ hardcode ในโค้ด** — เปลี่ยนง่าย, ไม่หลุดใน repo, และ migrate ไป backend/DB ได้สบายเมื่อมีระบบ admin หลายคน
>
> ⚠️ **Resend ต้อง verify โดเมนผู้ส่ง** (`from`) ก่อนถึงจะส่งจริงได้ — ช่วง dev ใช้ `onboarding@resend.dev` ของ Resend ส่งทดสอบได้เลย
>
> ⚠️ ฝั่ง client **ห้าม** ใส่ `RESEND_API_KEY` — ต้องเรียกผ่าน API route เท่านั้น

---

## 5. State (Zustand)

- [ ] `useProductStore`: neckType, color, setNeckType, setColor
- [ ] `useEditorStore`: activeSide, frontJSON, backJSON, fontsUsed, selectedObject, setActiveSide(), saveSide(), loadDesign()
  > ห้ามใช้ single global store — แยกตาม domain ตาม blueprint

---

## 6. UX/UI Direction (MVP-1)

- Clean / minimal / whitespace สูง (Canva, Linear vibe)
- Layout editor: **left toolbar** (เพิ่ม element) · **center canvas** · **right panel** (properties)
- Accent: electric blue `#00f0ff` กับ bold CTA
- Mobile: อย่างน้อยดู design + ปรับ text ได้ (drag เต็มที่บน desktop/tablet)
- Micro-interactions ลื่น (hover, select, drag feedback)

---

## 7. Acceptance Criteria (MVP-1 ถือว่าผ่านเมื่อ)

- [ ] เลือกคอกลม/คอวี + ขาว/ดำ แล้วเข้า editor ได้
- [ ] เพิ่มข้อความ + เปลี่ยน Google Font (รวมฟอนต์ไทย) เห็นผลทันที
- [ ] Upload SVG และ PNG/JPG วางบนเสื้อได้
- [ ] move / resize / rotate / delete / layer ทำงานครบ
- [ ] toggle front/back + เปลี่ยนสีเสื้อ preview สด
- [ ] Save design (JSON) แล้ว reload หน้า กลับมาเหมือนเดิม (font โหลดถูกต้อง)
- [ ] Export PNG preview ได้
- [ ] กด "ส่งแบบให้ทีมงาน" → admin ได้รับอีเมลแนบรูป front/back + ข้อมูลผู้สั่ง
- [ ] ใช้งานลื่น ไม่กระตุก บน desktop

---

## 8. Phase ถัดไป (อย่าทำตอนนี้ — บันทึกไว้)

| Phase | งาน |
|-------|-----|
| 2 | Auth (Clerk) + บันทึก design ลง PostgreSQL (`designs.canvas_json`) |
| 3 | Pricing engine (FastAPI) + realtime pricing panel |
| 4 | Checkout + PromptPay/slip upload + Orders |
| 5 | Customer dashboard + **Reorder** (loadFromJSON) + Admin |

> เมื่อขึ้น backend: ย้าย design จาก localStorage → R2 (`designs/{user_id}/...`) ผ่าน presigned URL + บันทึก JSON ลง DB ตาม schema ใน blueprint

---

## 9. คำสั่งสำหรับ AI ที่จะเขียนโค้ด (Prompt ตั้งต้น)

> ใช้เป็นบริบทเริ่มต้นเวลาสั่ง AI build:

```
สร้าง custom T-shirt design editor ด้วย Next.js 15 (App Router) + TypeScript strict +
TailwindCSS v4 + shadcn/ui + Fabric.js v6 + Zustand.

ขอบเขต MVP-1 เท่านั้น:
1. หน้าเลือกเสื้อ: ทรงคอกลม/คอวี, สีขาว/ดำ
2. หน้า editor แบบ Canva: เพิ่มข้อความ + Google Fonts (มีฟอนต์ไทย Kanit/Prompt/Sarabun),
   upload SVG/PNG/JPG, edit (move/resize/rotate/delete/layer), front/back toggle,
   เปลี่ยนสีเสื้อ preview สด, save JSON ลง localStorage, export PNG.
3. ปุ่ม "ส่งแบบให้ทีมงาน": กรอกชื่อ/เบอร์/จำนวน แล้วส่งอีเมลแนบรูป preview front/back
   ไปหา admin ผ่าน Next.js API route + Resend. อีเมล admin อ่านจาก env ADMIN_EMAIL
   (ค่า sirichai.basz@gmail.com) — RESEND_API_KEY อยู่ฝั่ง server เท่านั้น.

อย่าทำ: pricing, checkout, payment, auth, DB, AI image gen.
เน้น UX ลื่นเหมือน canva.com. โครงสร้างไฟล์ตาม TASK.md section 2.
```
