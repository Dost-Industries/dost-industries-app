export type CarbonEquivalentInputs = {
    carbon: string;
    manganese: string;
    chromium: string;
    molybdenum: string;
    vanadium: string;
    nickel: string;
    copper: string;
  };
  
  /*
   * IIW carbon equivalent:
   *
   * CEq =
   * C +
   * Mn / 6 +
   * (Cr + Mo + V) / 5 +
   * (Ni + Cu) / 15
   *
   * Input values are chemical composition
   * percentages. This module calculates and
   * reports the result only; it does not
   * classify weldability or provide advice.
   */
  export function calculateCarbonEquivalent(
    inputs: CarbonEquivalentInputs
  ): number | null {
    const carbon =
      Number(inputs.carbon);
  
    const manganese =
      Number(inputs.manganese);
  
    const chromium =
      Number(inputs.chromium);
  
    const molybdenum =
      Number(inputs.molybdenum);
  
    const vanadium =
      Number(inputs.vanadium);
  
    const nickel =
      Number(inputs.nickel);
  
    const copper =
      Number(inputs.copper);
  
    const values = [
      carbon,
      manganese,
      chromium,
      molybdenum,
      vanadium,
      nickel,
      copper,
    ];
  
    if (
      values.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0
      )
    ) {
      return null;
    }
  
    const ceq =
      carbon +
      manganese / 6 +
      (
        chromium +
        molybdenum +
        vanadium
      ) /
        5 +
      (
        nickel +
        copper
      ) /
        15;
  
    if (!Number.isFinite(ceq)) {
      return null;
    }
  
    return Number(
      ceq.toFixed(3)
    );
  }
  