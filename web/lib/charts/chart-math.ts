// Ported verbatim from the original index.html's niceStep/niceTicks.
export function niceStep(rough: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(rough || 1)));
  const n = rough / pow;
  let step: number;
  if (n <= 1) step = 1;
  else if (n <= 2) step = 2;
  else if (n <= 5) step = 5;
  else step = 10;
  return step * pow;
}

export function niceTicks(min: number, max: number, count: number): number[] {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const range = max - min;
  const step = niceStep(range / (count - 1));
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + 1e-9; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}
