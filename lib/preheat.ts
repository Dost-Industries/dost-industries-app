export type PreheatInputs = {
    carbon: string;
    manganese: string;
    molybdenum: string;
    chromium: string;
    copper: string;
    nickel: string;
    thickness: string;
    hydrogen: string;
    heatInput: string;
  };
  
  export type PreheatCalculation = {
    cet: number;
    tpCet: number;
    tpThickness: number;
    tpHydrogen: number;
    tpHeatInput: number;
    preheatTemperature: number;
  };
  
  export function calculatePreheat(
    inputs: PreheatInputs
  ): PreheatCalculation | null {
    const carbon = Number(inputs.carbon);
    const manganese = Number(inputs.manganese);
    const molybdenum = Number(inputs.molybdenum);
    const chromium = Number(inputs.chromium);
    const copper = Number(inputs.copper);
    const nickel = Number(inputs.nickel);
    const thickness = Number(inputs.thickness);
    const hydrogen = Number(inputs.hydrogen);
    const heatInput = Number(inputs.heatInput);
  
    const values = [
      carbon,
      manganese,
      molybdenum,
      chromium,
      copper,
      nickel,
      thickness,
      hydrogen,
      heatInput,
    ];
  
    if (
      values.some(
        (value) =>
          !Number.isFinite(value)
      )
    ) {
      return null;
    }
  
    const cet =
      carbon +
      (manganese + molybdenum) / 10 +
      (chromium + copper) / 20 +
      nickel / 40;
  
    const tpCet =
      750 * cet - 150;
  
    const tpThickness =
      160 * Math.tanh(thickness / 35) - 110;
  
    const tpHydrogen =
      62 * Math.pow(hydrogen, 0.35) - 100;
  
    const tpHeatInput =
      (53 * cet - 32) * heatInput -
      53 * cet +
      32;
  
    const preheatTemperature =
      tpCet +
      tpThickness +
      tpHydrogen +
      tpHeatInput;
  
    if (
      !Number.isFinite(
        preheatTemperature
      )
    ) {
      return null;
    }
  
    return {
      cet: Number(cet.toFixed(3)),
      tpCet: Number(tpCet.toFixed(1)),
      tpThickness: Number(
        tpThickness.toFixed(1)
      ),
      tpHydrogen: Number(
        tpHydrogen.toFixed(1)
      ),
      tpHeatInput: Number(
        tpHeatInput.toFixed(1)
      ),
      preheatTemperature: Number(
        preheatTemperature.toFixed(0)
      ),
    };
  }
  