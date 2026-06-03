import { create } from "zustand";
import type { NeckType, ShirtColor } from "@/types/product";

interface ProductStore {
  neckType: NeckType;
  color: ShirtColor;
  setNeckType: (neckType: NeckType) => void;
  setColor: (color: ShirtColor) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  neckType: "crew",
  color: "white",
  setNeckType: (neckType) => set({ neckType }),
  setColor: (color) => set({ color }),
}));
