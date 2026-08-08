import { describe, expect, it } from "vitest";

import {
  calculateHeatInput,
  PROCESS_EFFICIENCY,
} from "../lib/heat-input";

describe("calculateHeatInput", () => {
  it("calculates MIG / MAG heat input correctly", () => {
    const result = calculateHeatInput(
      "24",
      "220",
      "300",
      PROCESS_EFFICIENCY["MIG / MAG"],
      true
    );

    expect(result).toBe(0.84);
  });

  it("calculates TIG heat input correctly", () => {
    const result = calculateHeatInput(
      "12",
      "120",
      "120",
      PROCESS_EFFICIENCY.TIG,
      true
    );

    expect(result).toBe(0.43);
  });

  it("calculates electrode heat input correctly", () => {
    const result = calculateHeatInput(
      "25",
      "140",
      "180",
      PROCESS_EFFICIENCY.Elektrode,
      true
    );

    expect(result).toBe(0.93);
  });

  it("calculates SAW heat input correctly", () => {
    const result = calculateHeatInput(
      "30",
      "500",
      "500",
      PROCESS_EFFICIENCY.SAW,
      true
    );

    expect(result).toBe(1.8);
  });

  it("calculates arc energy without efficiency factor", () => {
    const result = calculateHeatInput(
      "24",
      "220",
      "300",
      PROCESS_EFFICIENCY["MIG / MAG"],
      false
    );

    expect(result).toBe(1.06);
  });

  it("returns null for empty values", () => {
    expect(
      calculateHeatInput(
        "",
        "220",
        "300",
        PROCESS_EFFICIENCY["MIG / MAG"],
        true
      )
    ).toBeNull();
  });

  it("returns null for zero values", () => {
    expect(
      calculateHeatInput(
        "24",
        "220",
        "0",
        PROCESS_EFFICIENCY["MIG / MAG"],
        true
      )
    ).toBeNull();
  });

  it("returns null for negative values", () => {
    expect(
      calculateHeatInput(
        "24",
        "-220",
        "300",
        PROCESS_EFFICIENCY["MIG / MAG"],
        true
      )
    ).toBeNull();
  });

  it("returns null for non-numeric values", () => {
    expect(
      calculateHeatInput(
        "abc",
        "220",
        "300",
        PROCESS_EFFICIENCY["MIG / MAG"],
        true
      )
    ).toBeNull();
  });
});