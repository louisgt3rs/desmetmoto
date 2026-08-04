import { describe, it, expect } from "vitest";
import { colorNameToHex } from "./colorSwatch";

describe("colorNameToHex", () => {
  it("matches a color keyword inside a longer colorway name", () => {
    expect(colorNameToHex("Diamond White")).toBe("#f5f5f0");
    expect(colorNameToHex("Supra Yellow")).toBe("#e8b923");
    expect(colorNameToHex("Snack White")).toBe("#f5f5f0");
  });

  it("is case-insensitive", () => {
    expect(colorNameToHex("MARK RED")).toBe(colorNameToHex("mark red"));
  });

  it("matches French color words", () => {
    expect(colorNameToHex("Rouge Racing")).toBe("#c0392b");
    expect(colorNameToHex("Gris Mat")).toBe("#8a8a8a");
  });

  it("falls back to neutral grey for unrecognized names", () => {
    expect(colorNameToHex("Abstract Blue")).not.toBe("#6b6b6b");
    expect(colorNameToHex("XYZ-9000")).toBe("#6b6b6b");
  });
});
