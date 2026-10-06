export function progressColors(): Record<'read' | 'crypto' | 'upload' | 'done' | 'error', string> {
  const style = getComputedStyle(document.documentElement);
  const channels = (name: string, fallback: number[]) => {
    const values = style.getPropertyValue(`--not3-${name}`).trim().split(/\s+/).map(Number);
    return values.length === 3 && values.every(Number.isFinite) ? values : fallback;
  };
  const bg = channels('bg', [0, 0, 0]);
  const fg = channels('fg', [255, 255, 255]);
  const mix = (weight: number) => `rgb(${bg.map((base, i) => Math.round(base * (1 - weight) + fg[i]! * weight)).join(', ')})`;
  return {
    read: mix(0.2),
    crypto: mix(0.4),
    upload: mix(2 / 3),
    done: mix(1),
    error: '#f00',
  };
}
