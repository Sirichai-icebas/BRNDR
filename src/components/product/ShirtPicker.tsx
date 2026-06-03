"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/stores/useProductStore";
import { SHIRT_TEMPLATES } from "@/lib/shirt-templates";
import type { NeckType, ShirtColor } from "@/types/product";
import { cn } from "@/lib/utils";

const NECK_OPTIONS: { value: NeckType; label: string; sub: string }[] = [
  { value: "crew", label: "คอกลม", sub: "Crew Neck" },
  { value: "v-neck", label: "คอวี", sub: "V-Neck" },
];

const COLOR_OPTIONS: { value: ShirtColor; label: string; hex: string }[] = [
  { value: "white", label: "White", hex: "#F0EFEC" },
  { value: "black", label: "Black", hex: "#181818" },
];

export function ShirtPicker() {
  const router = useRouter();
  const { neckType, color, setNeckType, setColor } = useProductStore();

  const previewPath = SHIRT_TEMPLATES[`${neckType}-${color}`].front;

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row">

      {/* Left — Preview */}
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface)] py-16 px-8">
        <div className="relative w-64 h-80 lg:w-80 lg:h-96">
          <Image
            src={previewPath}
            alt={`${neckType} ${color}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right — Controls */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col justify-center px-10 py-16 gap-12">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight leading-snug">
            เลือกแบบเสื้อ
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
            Custom merchandise — ออกแบบเอง สั่งผลิตได้ทันที
          </p>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-[var(--color-border)]" />

        {/* Neck type */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--color-muted)]">
            ทรงคอ
          </p>
          <div className="flex gap-3">
            {NECK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setNeckType(opt.value)}
                className={cn(
                  "flex-1 py-4 px-3 text-left border transition-all duration-200",
                  neckType === opt.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] hover:border-[var(--color-muted)]",
                )}
              >
                <p className="text-sm font-medium leading-none">{opt.label}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1 tracking-wide",
                    neckType === opt.value
                      ? "text-white/60"
                      : "text-[var(--color-muted)]",
                  )}
                >
                  {opt.sub}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--color-muted)]">
            สีเสื้อ
          </p>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setColor(opt.value)}
                className={cn(
                  "flex items-center gap-3 flex-1 py-4 px-4 border text-left transition-all duration-200",
                  color === opt.value
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-muted)]",
                )}
              >
                <span
                  className="w-5 h-5 flex-shrink-0 border border-[var(--color-border)]"
                  style={{ background: opt.hex }}
                />
                <span className="text-sm font-medium">{opt.label}</span>
                {color === opt.value && (
                  <span className="ml-auto text-[10px] text-[var(--color-muted)]">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-[var(--color-border)]" />

        {/* CTA */}
        <button
          onClick={() => router.push("/editor")}
          className="w-full py-5 bg-[var(--color-primary)] text-white text-sm font-semibold tracking-[0.1em] uppercase hover:bg-[var(--color-primary)]/85 transition-colors duration-200"
        >
          เริ่มออกแบบ →
        </button>

        {/* Footer note */}
        <p className="text-[11px] text-[var(--color-muted)] leading-relaxed -mt-6">
          ออกแบบฟรี · เห็นราคาทันที · สั่งผลิตขั้นต่ำ 10 ตัว
        </p>
      </div>
    </div>
  );
}
