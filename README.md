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

## Design System

**Inspired by [aimer.com](https://aimer.com) — luxury minimal aesthetic**

| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#0D0D0D` | Near-black — CTA, headings |
| `--color-accent` | `#B8A898` | Warm taupe — selected state |
| `--color-surface` | `#F8F7F4` | Warm off-white — page background |
| `--color-card` | `#FFFFFF` | Pure white — cards, panels |
| `--color-muted` | `#9B9589` | Warm gray — secondary text |
| `--color-border` | `#E8E6E1` | Subtle warm border |
| `--radius-base` | `0.25rem` | Tight radius — refined, minimal |

**Typography:** Geist Sans · tight letter-spacing · `-0.03em` headings · antialiased

**Mood:** Clean luxury, generous whitespace, no neon, premium without being cold

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
