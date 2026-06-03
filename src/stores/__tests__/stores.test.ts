import { describe, it, expect, beforeEach } from "vitest";
import { useProductStore } from "../useProductStore";
import { useEditorStore } from "../useEditorStore";

describe("useProductStore", () => {
  beforeEach(() => {
    useProductStore.setState({ neckType: "crew", color: "white" });
  });

  it("default values", () => {
    const s = useProductStore.getState();
    expect(s.neckType).toBe("crew");
    expect(s.color).toBe("white");
  });

  it("setNeckType updates neckType", () => {
    useProductStore.getState().setNeckType("v-neck");
    expect(useProductStore.getState().neckType).toBe("v-neck");
  });

  it("setColor updates color", () => {
    useProductStore.getState().setColor("black");
    expect(useProductStore.getState().color).toBe("black");
  });
});

describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("saveSide stores front JSON", () => {
    const json = { objects: [{ type: "text", text: "hello" }] };
    useEditorStore.getState().saveSide("front", json);
    expect(useEditorStore.getState().frontJSON).toEqual(json);
  });

  it("saveSide stores back JSON without affecting front", () => {
    const front = { objects: [{ type: "text", text: "front" }] };
    const back = { objects: [{ type: "image" }] };
    useEditorStore.getState().saveSide("front", front);
    useEditorStore.getState().saveSide("back", back);
    expect(useEditorStore.getState().frontJSON).toEqual(front);
    expect(useEditorStore.getState().backJSON).toEqual(back);
  });

  it("addFont adds unique font only", () => {
    useEditorStore.getState().addFont("Kanit");
    useEditorStore.getState().addFont("Kanit");
    useEditorStore.getState().addFont("Prompt");
    expect(useEditorStore.getState().fontsUsed).toEqual(["Kanit", "Prompt"]);
  });

  it("loadDesign restores state", () => {
    const state = {
      product: { neckType: "v-neck" as const, color: "black" as const },
      front: { objects: [{ type: "text" }] },
      back: { objects: [] },
      fontsUsed: ["Sarabun"],
      updatedAt: "2025-01-01T00:00:00.000Z",
    };
    useEditorStore.getState().loadDesign(state);
    expect(useEditorStore.getState().frontJSON).toEqual(state.front);
    expect(useEditorStore.getState().fontsUsed).toEqual(["Sarabun"]);
    expect(useEditorStore.getState().activeSide).toBe("front");
  });

  it("reset clears all state", () => {
    useEditorStore.getState().saveSide("front", { objects: [{}] });
    useEditorStore.getState().addFont("Kanit");
    useEditorStore.getState().reset();
    expect(useEditorStore.getState().fontsUsed).toEqual([]);
  });
});
