export function safeDivide(n: number, d: number): { value: number | null; reason?: string } {
  if (d === 0) return { value: null, reason: "division_by_zero" };
  return { value: n / d };
}

export function diff(a: number, b: number) {
  return a - b;
}

export function growthRate(current: number, base: number) {
  return safeDivide(current - base, base);
}
