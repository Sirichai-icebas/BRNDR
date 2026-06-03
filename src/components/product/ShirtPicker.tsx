"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/stores/useProductStore";
import { SHIRT_TEMPLATES } from "@/lib/shirt-templates";
import type { NeckType, ShirtColor } from "@/types/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NECK_OPTIONS: { value: NeckType; label: string }[] = [
  { value: "crew", label: "คอกลม" },
  { value: "v-neck", label: "คอวี" },
];

const COLOR_OPTIONS: { value: ShirtColor; label: string; hex: string }[] = [
  { value: "white", label: "ขาว", hex: "#f0f0f0" },
  { value: "black", label: "ดำ", hex: "#1a1a1a" },
];

export function ShirtPicker() {
  const router = useRouter();
  const { neckType, color, setNeckType, setColor } = useProductStore();

  const previewPath = SHIRT_TEMPLATES[`${neckType}-${color}`].front;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">เลือกแบบเสื้อ</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          เลือกทรงคอและสี แล้วเริ่มออกแบบได้เลย
        </p>
      </div>

      {/* Preview */}
      <div className="relative w-56 h-72 rounded-2xl overflow-hidden bg-[var(--color-surface)] border">
        <Image
          src={previewPath}
          alt={`${neckType} ${color}`}
          fill
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Neck type */}
      <div className="w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          ทรงคอ
        </p>
        <div className="grid grid-cols-2 gap-3">
          {NECK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setNeckType(opt.value)}
              className={cn(
                "relative rounded-xl border-2 p-4 text-sm font-medium transition-all",
                neckType === opt.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-foreground"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              {opt.label}
              {neckType === opt.value && (
                <span className="absolute top-2 right-2 text-[var(--color-accent)] text-xs">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          สีเสื้อ
        </p>
        <div className="flex gap-4">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setColor(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all",
                color === opt.value
                  ? "border-[var(--color-accent)]"
                  : "border-border hover:border-muted-foreground/40",
              )}
            >
              <span
                className="w-5 h-5 rounded-full border"
                style={{
                  background: opt.hex,
                  borderColor: opt.value === "white" ? "#ccc" : "#000",
                }}
              />
              {opt.label}
              {color === opt.value && (
                <span className="text-[var(--color-accent)] text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white text-base font-semibold rounded-xl h-14"
        onClick={() => router.push("/editor")}
      >
        เริ่มออกแบบ →
      </Button>
    </div>
  );
}
