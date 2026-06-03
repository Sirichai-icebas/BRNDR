import type { NeckType, ShirtColor, Side } from "@/types/product";
import type { PrintArea } from "@/types/editor";

interface ShirtTemplate {
  front: string;
  back: string;
  /** Print area coordinates relative to a 400×500 canvas */
  printAreaFront: PrintArea;
  printAreaBack: PrintArea;
}

type TemplateKey = `${NeckType}-${ShirtColor}`;

// ⚠️ Replace SVG paths with real product mockup images before launch
export const SHIRT_TEMPLATES: Record<TemplateKey, ShirtTemplate> = {
  "crew-white": {
    front: "/mockups/crew-white-front.svg",
    back: "/mockups/crew-white-back.svg",
    printAreaFront: { x: 130, y: 130, w: 140, h: 170 },
    printAreaBack: { x: 130, y: 130, w: 140, h: 200 },
  },
  "crew-black": {
    front: "/mockups/crew-black-front.svg",
    back: "/mockups/crew-black-back.svg",
    printAreaFront: { x: 130, y: 130, w: 140, h: 170 },
    printAreaBack: { x: 130, y: 130, w: 140, h: 200 },
  },
  "v-neck-white": {
    front: "/mockups/v-neck-white-front.svg",
    back: "/mockups/v-neck-white-back.svg",
    printAreaFront: { x: 130, y: 140, w: 140, h: 160 },
    printAreaBack: { x: 130, y: 130, w: 140, h: 200 },
  },
  "v-neck-black": {
    front: "/mockups/v-neck-black-front.svg",
    back: "/mockups/v-neck-black-back.svg",
    printAreaFront: { x: 130, y: 140, w: 140, h: 160 },
    printAreaBack: { x: 130, y: 130, w: 140, h: 200 },
  },
};

export function getTemplate(
  neckType: NeckType,
  color: ShirtColor,
  side: Side,
): { imagePath: string; printArea: PrintArea } {
  const key: TemplateKey = `${neckType}-${color}`;
  const template = SHIRT_TEMPLATES[key];
  return {
    imagePath: side === "front" ? template.front : template.back,
    printArea:
      side === "front" ? template.printAreaFront : template.printAreaBack,
  };
}
