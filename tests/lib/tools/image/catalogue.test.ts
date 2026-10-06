import { expect, it } from 'vitest';
import { getTool } from '../../../../lib/tools/registry';

it('registers the geometry and pixel tools with their stage and option contracts', () => {
  expect(getTool('crop')).toMatchObject({ category: 'image', title: 'Crop', inputs: [{ kind: 'image', stage: 'crop' }] });
  expect(getTool('crop')?.options.find(option => option.id === 'aspect')).toMatchObject({ type: 'select', default: 'free', values: ['free', '1:1', '4:3', '16:9', '3:2', 'custom'].map(value => ({ value, label: expect.any(String) })) });
  expect(getTool('region-blur')).toMatchObject({ category: 'image', title: 'Blur region', inputs: [{ kind: 'image', stage: 'region' }] });
  expect(getTool('palette')).toMatchObject({ category: 'image', title: 'Colour picker', inputs: [{ kind: 'image', stage: 'point' }] });
  expect(getTool('outline')).toMatchObject({ category: 'image', title: 'Sticker outline', inputs: [{ kind: 'image' }] });
  expect(getTool('outline')?.options.map(option => [option.id, option.default])).toEqual([['thickness', 12], ['colour', '#ffffff'], ['roundCorners', true], ['shadow', false]]);
});
