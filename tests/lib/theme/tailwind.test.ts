import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../../../tailwind.config.js';

describe('semantic Tailwind colors', () => {
  it('generates palette and alpha utilities from theme variables', async () => {
    const result = await postcss([tailwindcss({
      ...config,
      content: [{ raw: '<div class="bg-black bg-white/50 bg-panel/40 text-accent border-white/20"></div>' }],
    })]).process('@tailwind utilities;', { from: undefined });
    expect(result.css).toContain('var(--not3-bg)');
    expect(result.css).toContain('var(--not3-fg)');
    expect(result.css).toContain('var(--not3-panel)');
    expect(result.css).toContain('var(--not3-accent)');
    expect(result.css).toMatch(/rgb\(var\(--not3-fg\)\s*\/\s*0\.5\)/);
    expect(result.css).toMatch(/rgb\(var\(--not3-panel\)\s*\/\s*0\.4\)/);
  });
});
