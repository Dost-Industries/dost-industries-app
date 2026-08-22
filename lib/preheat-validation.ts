import type {
    PreheatInputs,
  } from "./preheat";
  
  export type PreheatField =
    keyof PreheatInputs;
  
  export type PreheatErrors =
    Partial<
      Record<
        PreheatField | "cet",
        string
      >
    >;
  
  type Range = {
    min: number;
    max: number;
    unit: string;
  };
  
  export const PREHEAT_RANGES: Record<
    PreheatField,
    Range
  > = {
    carbon: {
      min: 0.05,
      max: 0.32,
      unit: "%",
    },
    manganese: {
      min: 0.5,
      max: 1.9,
      unit: "%",
    },
    molybdenum: {
      min: 0,
      max: 0.75,
      unit: "%",
    },
    chromium: {
      min: 0,
      max: 1.5,
      unit: "%",
    },
    copper: {
      min: 0,
      max: 0.7,
      unit: "%",
    },
    nickel: {
      min: 0,
      max: 2.5,
      unit: "%",
    },
    thickness: {
      min: 10,
      max: 90,
      unit: "mm",
    },
    hydrogen: {
      min: 1,
      max: 20,
      unit: "ml/100g",
    },
    heatInput: {
      min: 0.5,
      max: 4,
      unit: "kJ/mm",
    },
  };
  
  export const CET_RANGE = {
    min: 0.2,
    max: 0.5,
    unit: "%",
  } as const;
  
  const FIELD_LABELS: Record<
    PreheatField,
    string
  > = {
    carbon: "Carbon",
    manganese: "Manganese",
    molybdenum: "Molybdenum",
    chromium: "Chromium",
    copper: "Copper",
    nickel: "Nickel",
    thickness: "Plate thickness",
    hydrogen: "Hydrogen content",
    heatInput: "Heat input",
  };
  
  export function formatRange(
    field: PreheatField
  ): string {
    const range =
      PREHEAT_RANGES[field];
  
    return `${range.min}-${range.max} ${range.unit}`;
  }
  
  export function validatePreheatFields(
    inputs: PreheatInputs
  ): PreheatErrors {
    const errors: PreheatErrors = {};
  
    (
      Object.keys(
        PREHEAT_RANGES
      ) as PreheatField[]
    ).forEach((field) => {
      const rawValue =
        inputs[field].trim();
  
      if (!rawValue) {
        return;
      }
  
      const value = Number(rawValue);
      const range =
        PREHEAT_RANGES[field];
  
      if (!Number.isFinite(value)) {
        errors[field] =
          `${FIELD_LABELS[field]} must be a number.`;
        return;
      }
  
      if (
        value < range.min ||
        value > range.max
      ) {
        errors[field] =
          `${FIELD_LABELS[field]} must be between ${range.min} and ${range.max} ${range.unit} for this calculation method.`;
      }
    });
  
    return errors;
  }
  
  export function validateCetRange(
    cet: number | null
  ): string | undefined {
    if (cet === null) {
      return undefined;
    }
  
    if (
      cet < CET_RANGE.min ||
      cet > CET_RANGE.max
    ) {
      return `Calculated CET (${cet.toFixed(
        3
      )}%) is outside the range ${CET_RANGE.min}-${CET_RANGE.max}%.`;
    }
  
    return undefined;
  }
  
  export function hasPreheatValidationErrors(
    errors: PreheatErrors
  ): boolean {
    return (
      Object.keys(errors).length > 0
    );
  }
  
  export function hasCompletePreheatInputs(
    inputs: PreheatInputs
  ): boolean {
    return Object.values(inputs).every(
      (value) =>
        value.trim() !== ""
    );
  }
  