export type WeldingProcess = "MIG / MAG" | "TIG" | "Elektrode" | "SAW";

export const PROCESS_EFFICIENCY: Record<WeldingProcess, number> = {
  "MIG / MAG": 0.8,
  TIG: 0.6,
  Elektrode: 0.75,
  SAW: 1.0,
};

export function calculateHeatInput(
  voltage: string,
  amperage: string,
  speed: string,
  efficiency: number,
  useFactor: boolean
): number | null {
  const V = parseFloat(voltage);
  const A = parseFloat(amperage);
  const S = parseFloat(speed);

  if (isNaN(V) || isNaN(A) || isNaN(S) || V <= 0 || A <= 0 || S <= 0) {
    return null;
  }

  const factor = useFactor ? efficiency : 1;
  const hi = (V * A * 60 * factor) / (1000 * S);

  if (!isFinite(hi)) return null;

  return Number(hi.toFixed(2));
}