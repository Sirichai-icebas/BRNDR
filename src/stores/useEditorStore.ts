import { create } from "zustand";
import type { Side } from "@/types/product";
import type { DesignState } from "@/types/editor";
import type { ProductSelection } from "@/types/product";

interface EditorStore {
  activeSide: Side;
  frontJSON: object;
  backJSON: object;
  fontsUsed: string[];
  addFont: (family: string) => void;
  saveSide: (side: Side, json: object) => void;
  getDesignState: (product: ProductSelection) => DesignState;
  loadDesign: (state: DesignState) => void;
  reset: () => void;
}

const EMPTY_CANVAS = { version: "6.0.0", objects: [] };

export const useEditorStore = create<EditorStore>((set, get) => ({
  activeSide: "front",
  frontJSON: EMPTY_CANVAS,
  backJSON: EMPTY_CANVAS,
  fontsUsed: [],

  addFont: (family) =>
    set((s) => ({
      fontsUsed: s.fontsUsed.includes(family)
        ? s.fontsUsed
        : [...s.fontsUsed, family],
    })),

  saveSide: (side, json) =>
    set(side === "front" ? { frontJSON: json } : { backJSON: json }),

  getDesignState: (product) => ({
    product,
    front: get().frontJSON,
    back: get().backJSON,
    fontsUsed: get().fontsUsed,
    updatedAt: new Date().toISOString(),
  }),

  loadDesign: (state) =>
    set({
      frontJSON: state.front,
      backJSON: state.back,
      fontsUsed: state.fontsUsed,
      activeSide: "front",
    }),

  reset: () =>
    set({
      activeSide: "front",
      frontJSON: EMPTY_CANVAS,
      backJSON: EMPTY_CANVAS,
      fontsUsed: [],
    }),
}));
