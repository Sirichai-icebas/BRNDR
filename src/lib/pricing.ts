/**
 * Pricing — ตารางราคา + ตัวคำนวณราคาเสื้อ custom
 *
 * 🛠️  แก้ราคาที่ PRICING_CONFIG ด้านล่างได้เลย (ไม่ต้องแตะ logic)
 *     ทุกค่าเป็นเงินบาท (THB) ต่อ "ตัว" ยกเว้นที่ระบุว่า "ต่อครั้ง/ต่อออเดอร์"
 *
 * หมายเหตุ: เวอร์ชันนี้เก็บเรตในไฟล์ (แก้ง่าย) — เมื่อทำ task25/task22
 * จะย้ายเรตไปตาราง PricingRule ใน DB โดยใช้ logic เดิม
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type ShirtSize = "S" | "M" | "L" | "XL" | "2XL" | "3XL";
export type PrintTechnique = "silkscreen" | "dtf";
/** ขนาดบล็อก/พื้นที่สกรีน (อ้างอิงขนาดกระดาษเพื่อให้สื่อสารง่าย) */
export type ScreenSize = "A5" | "A4" | "A3";
export type PrintPosition = "front" | "back";

export interface PriceInput {
  /** จำนวนเสื้อแยกตามไซส์ เช่น { M: 20, L: 30 } */
  sizes: Partial<Record<ShirtSize, number>>;
  technique: PrintTechnique;
  /** จำนวนสีที่ใช้พิมพ์ (มีผลกับ silkscreen เป็นหลัก) */
  colors: number;
  /** ตำแหน่งที่พิมพ์ — ใส่ได้ทั้งหน้าและหลัง */
  positions: PrintPosition[];
  /** ขนาดสกรีนของลายแต่ละตำแหน่ง */
  screenSize: ScreenSize;
  /** งานด่วน (true = คิดเพิ่มตาม rushMultiplier) */
  rush?: boolean;
}

export interface PriceBreakdown {
  quantity: number;
  shirtCost: number; // ค่าเสื้อเปล่ารวม (ตามไซส์)
  setupCost: number; // ค่าบล็อก/ค่าเซ็ตงาน (ต่อออเดอร์)
  printCost: number; // ค่าพิมพ์รวม (ตามสี/ตำแหน่ง/ขนาด/จำนวน)
  discount: number; // ส่วนลดจำนวน (บาท)
  rushSurcharge: number; // ค่าด่วน (บาท)
  total: number; // ราคารวมสุทธิ
  unitPrice: number; // ราคาเฉลี่ยต่อตัว
  productionDays: number; // ระยะเวลาผลิต (วัน)
}

// ─────────────────────────────────────────────────────────────
// 🛠️ PRICING_CONFIG — แก้ตรงนี้
// ─────────────────────────────────────────────────────────────
export const PRICING_CONFIG = {
  /** ราคาเสื้อเปล่าต่อตัว แยกตามไซส์ (ไซส์ใหญ่แพงกว่า) */
  shirtBasePrice: {
    S: 120,
    M: 120,
    L: 120,
    XL: 130,
    "2XL": 140,
    "3XL": 150,
  } as Record<ShirtSize, number>,

  /** สกรีน (silkscreen): คิดตามจำนวนสี */
  silkscreen: {
    /** ค่าบล็อกต่อ 1 สี ต่อ 1 ตำแหน่ง (คิดครั้งเดียวต่อออเดอร์) */
    setupCostPerColor: 100,
    /** ค่าพิมพ์ต่อสี ต่อตำแหน่ง ต่อตัว */
    pricePerColorPerPiece: 4,
  },

  /** DTF: ราคาเหมาตามตำแหน่ง (ไม่คิดตามสี) */
  dtf: {
    /** ค่าเซ็ตไฟล์ต่อออเดอร์ */
    setupCost: 150,
    /** ค่าพิมพ์ต่อตำแหน่ง ต่อตัว (ราคาฐานก่อนคูณขนาดสกรีน) */
    pricePerPositionPerPiece: 25,
  },

  /** ตัวคูณตามขนาดสกรีน (ลายใหญ่ = แพงขึ้น) */
  screenSizeMultiplier: {
    A5: 1.0,
    A4: 1.3,
    A3: 1.6,
  } as Record<ScreenSize, number>,

  /**
   * ส่วนลดตามจำนวน — เรียงจากมากไปน้อย
   * ถึงขั้นไหนใช้ discount ของขั้นนั้น (เป็นสัดส่วน 0–1)
   */
  quantityDiscount: [
    { minQty: 200, discount: 0.15 },
    { minQty: 100, discount: 0.1 },
    { minQty: 50, discount: 0.05 },
    { minQty: 1, discount: 0 },
  ],

  /** งานด่วน: คูณราคารวม */
  rushMultiplier: 1.3,

  /** ระยะเวลาผลิต (วัน) */
  productionDays: {
    normal: 7,
    rush: 3,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// Calculator (pure — ไม่แตะ DOM/network)
// ─────────────────────────────────────────────────────────────
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function quantityDiscountRate(qty: number): number {
  for (const tier of PRICING_CONFIG.quantityDiscount) {
    if (qty >= tier.minQty) return tier.discount;
  }
  return 0;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const { sizes, technique, colors, positions, screenSize, rush = false } =
    input;

  const quantity = Object.values(sizes).reduce(
    (sum, n) => sum + (n ?? 0),
    0,
  );
  if (quantity <= 0) {
    throw new Error("ต้องระบุจำนวนเสื้ออย่างน้อย 1 ตัว");
  }
  if (positions.length === 0) {
    throw new Error("ต้องเลือกตำแหน่งพิมพ์อย่างน้อย 1 ตำแหน่ง");
  }

  // ค่าเสื้อเปล่า — รวมตามไซส์
  let shirtCost = 0;
  for (const [size, count] of Object.entries(sizes)) {
    const price = PRICING_CONFIG.shirtBasePrice[size as ShirtSize];
    shirtCost += price * (count ?? 0);
  }

  const sizeMul = PRICING_CONFIG.screenSizeMultiplier[screenSize];
  const positionCount = positions.length;

  let setupCost: number;
  let printCost: number;

  if (technique === "silkscreen") {
    const { setupCostPerColor, pricePerColorPerPiece } =
      PRICING_CONFIG.silkscreen;
    // ค่าบล็อก: ต่อสี ต่อตำแหน่ง (ครั้งเดียว)
    setupCost = setupCostPerColor * colors * positionCount;
    // ค่าพิมพ์: ต่อสี ต่อตำแหน่ง ต่อตัว × ตัวคูณขนาด
    printCost =
      pricePerColorPerPiece * colors * positionCount * quantity * sizeMul;
  } else {
    const { setupCost: dtfSetup, pricePerPositionPerPiece } =
      PRICING_CONFIG.dtf;
    setupCost = dtfSetup;
    printCost =
      pricePerPositionPerPiece * positionCount * quantity * sizeMul;
  }

  const subtotal = shirtCost + setupCost + printCost;
  const discount = round(subtotal * quantityDiscountRate(quantity));
  const afterDiscount = subtotal - discount;

  const rushSurcharge = rush
    ? round(afterDiscount * (PRICING_CONFIG.rushMultiplier - 1))
    : 0;
  const total = round(afterDiscount + rushSurcharge);

  return {
    quantity,
    shirtCost: round(shirtCost),
    setupCost: round(setupCost),
    printCost: round(printCost),
    discount,
    rushSurcharge,
    total,
    unitPrice: round(total / quantity),
    productionDays: rush
      ? PRICING_CONFIG.productionDays.rush
      : PRICING_CONFIG.productionDays.normal,
  };
}
