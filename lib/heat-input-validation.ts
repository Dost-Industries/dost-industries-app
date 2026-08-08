export type HeatInputField = "voltage" | "amperage" | "speed";

export type HeatInputValidationErrors = Partial<
  Record<HeatInputField, string>
>;

export function validatePositiveNumber(
  value: string,
  label: string
): string | null {
  if (value.trim() === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return `${label} must be a valid number.`;
  }

  if (number <= 0) {
    return `${label} must be greater than 0.`;
  }

  return null;
}

export function validateHeatInputFields(
  voltage: string,
  amperage: string,
  speed: string
): HeatInputValidationErrors {
  const errors: HeatInputValidationErrors = {};

  const voltageError = validatePositiveNumber(
    voltage,
    "Voltage"
  );

  const amperageError = validatePositiveNumber(
    amperage,
    "Amperage"
  );

  const speedError = validatePositiveNumber(
    speed,
    "Travel speed"
  );

  if (voltageError) {
    errors.voltage = voltageError;
  }

  if (amperageError) {
    errors.amperage = amperageError;
  }

  if (speedError) {
    errors.speed = speedError;
  }

  return errors;
}

export function hasHeatInputValidationErrors(
  errors: HeatInputValidationErrors
): boolean {
  return Object.keys(errors).length > 0;
}