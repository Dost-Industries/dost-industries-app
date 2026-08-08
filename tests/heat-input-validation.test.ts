import { describe, expect, it } from "vitest";

import {
  hasHeatInputValidationErrors,
  validateHeatInputFields,
  validatePositiveNumber,
} from "../lib/heat-input-validation";

describe("heat input validation", () => {
  it("accepts valid positive numbers", () => {
    expect(validatePositiveNumber("24", "Voltage")).toBeNull();
    expect(validatePositiveNumber("220.5", "Amperage")).toBeNull();
    expect(validatePositiveNumber("300", "Travel speed")).toBeNull();
  });

  it("allows an empty field while the user is still entering data", () => {
    expect(validatePositiveNumber("", "Voltage")).toBeNull();
    expect(validatePositiveNumber("   ", "Voltage")).toBeNull();
  });

  it("rejects zero", () => {
    expect(validatePositiveNumber("0", "Voltage")).toBe(
      "Voltage must be greater than 0."
    );
  });

  it("rejects negative numbers", () => {
    expect(validatePositiveNumber("-10", "Amperage")).toBe(
      "Amperage must be greater than 0."
    );
  });

  it("rejects invalid numeric input", () => {
    expect(validatePositiveNumber("abc", "Voltage")).toBe(
      "Voltage must be a valid number."
    );
  });

  it("returns errors for every invalid heat input field", () => {
    const errors = validateHeatInputFields("0", "-5", "abc");

    expect(errors).toEqual({
      voltage: "Voltage must be greater than 0.",
      amperage: "Amperage must be greater than 0.",
      speed: "Travel speed must be a valid number.",
    });
  });

  it("returns no errors for valid heat input fields", () => {
    expect(
      validateHeatInputFields("24", "220", "300")
    ).toEqual({});
  });

  it("detects whether validation errors exist", () => {
    expect(
      hasHeatInputValidationErrors(
        validateHeatInputFields("24", "220", "300")
      )
    ).toBe(false);

    expect(
      hasHeatInputValidationErrors(
        validateHeatInputFields("0", "220", "300")
      )
    ).toBe(true);
  });
});