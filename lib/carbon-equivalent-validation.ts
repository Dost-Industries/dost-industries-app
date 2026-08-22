import type {
    CarbonEquivalentInputs,
  } from "./carbon-equivalent";
  
  export type CarbonEquivalentField =
    keyof CarbonEquivalentInputs;
  
  export type CarbonEquivalentErrors =
    Partial<
      Record<
        CarbonEquivalentField,
        string
      >
    >;
  
  const FIELD_LABELS: Record<
    CarbonEquivalentField,
    string
  > = {
    carbon: "Carbon",
    manganese: "Manganese",
    chromium: "Chromium",
    molybdenum: "Molybdenum",
    vanadium: "Vanadium",
    nickel: "Nickel",
    copper: "Copper",
  };
  
  function validatePercentage(
    value: string,
    label: string
  ): string | undefined {
    if (!value.trim()) {
      return `${label} is required.`;
    }
  
    const number =
      Number(value);
  
    if (!Number.isFinite(number)) {
      return `${label} must be a number.`;
    }
  
    if (number < 0) {
      return `${label} cannot be negative.`;
    }
  
    if (number > 100) {
      return `${label} cannot exceed 100%.`;
    }
  
    return undefined;
  }
  
  export function validateCarbonEquivalentFields(
    inputs: CarbonEquivalentInputs
  ): CarbonEquivalentErrors {
    const errors:
      CarbonEquivalentErrors = {};
  
    (
      Object.keys(
        FIELD_LABELS
      ) as CarbonEquivalentField[]
    ).forEach((field) => {
      const error =
        validatePercentage(
          inputs[field],
          FIELD_LABELS[field]
        );
  
      if (error) {
        errors[field] = error;
      }
    });
  
    return errors;
  }
  
  export function hasCarbonEquivalentValidationErrors(
    errors: CarbonEquivalentErrors
  ): boolean {
    return Object.keys(
      errors
    ).length > 0;
  }
  