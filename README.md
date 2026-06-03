# BRNDR — Custom Merch Design Editor

เว็บออกแบบเสื้อแบบ Canva: เลือกทรงเสื้อ → ออกแบบบน canvas (ข้อความ + Google Fonts, อัปโหลด SVG/รูป, แก้ไขเต็มที่, สลับ front/back, เปลี่ยนสี) → ส่งแบบเข้าอีเมลทีมงาน

> **ขอบเขต MVP-1:** frontend ล้วน (ยังไม่มี backend/DB/auth) — ดู `task_1.md` และ `dev-tasks.md`

## Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS v4 + shadcn/ui |
| Canvas | Fabric.js v6 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Email | Resend (ผ่าน API route) |

## Design Tokens

Black/White base + accent electric-blue `#00f0ff`, font sans (รวมฟอนต์ไทย) — แนว modern creator tool

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

### Environment (`.env.local`)

```bash
RESEND_API_KEY=re_...                 # server-side only
ADMIN_EMAIL=sirichai.basz@gmail.com   # ปลายทางรับแบบเสื้อ
```

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # type check
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # product selection
│   ├── editor/                    # canvas editor ("use client")
│   └── api/submit-design/         # ส่งอีเมลไป admin (server)
├── components/
│   ├── ui/                        # shadcn base
│   ├── product/                   # ShirtPicker
│   └── editor/                    # Canvas, Toolbar, panels
├── stores/                        # useProductStore, useEditorStore
├── lib/                           # fabric-helpers, google-fonts, templates
└── types/                         # domain types
```
