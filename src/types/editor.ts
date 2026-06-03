import type { ProductSelection, Side } from "./product";

export type { Side };

export interface PrintArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DesignState {
  product: ProductSelection;
  front: object; // Fabric.js JSON
  back: object;
  fontsUsed: string[];
  updatedAt: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  quantity: number;
  notes?: string;
}
