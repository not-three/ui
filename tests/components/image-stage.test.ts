import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ImageStage from '~/components/tools/image-stage.vue';

it('keeps numeric crop coordinates in natural pixels and emits updates', async () => {
  const wrapper = mount(ImageStage, { props: { mode: 'crop', width: 100, height: 50, value: { x: 5, y: 6, width: 20, height: 10 }, checkerboard: true } });
  await wrapper.get('input[aria-label="Crop x"]').setValue('12');
  expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual({ x: 12, y: 6, width: 20, height: 10 });
  expect(wrapper.get('[data-stage]').classes()).toContain('image-checkerboard');
  wrapper.unmount();
});

it('keeps aspect ratio when height is entered numerically', async () => {
  const wrapper = mount(ImageStage, { props: { mode: 'crop', width: 100, height: 100, aspect: 2, value: { x: 5, y: 5, width: 20, height: 10 }, checkerboard: false } });
  await wrapper.get('input[aria-label="Crop height"]').setValue('15');
  expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual({ x: 5, y: 5, width: 30, height: 15 });
  wrapper.unmount();
});

it('resizes the aspect-locked rectangle from its north handle', async () => {
  const wrapper = mount(ImageStage, { props: { mode: 'crop', width: 100, height: 100, aspect: 2, value: { x: 10, y: 10, width: 20, height: 10 }, checkerboard: false } });
  const frame = wrapper.get('[data-frame]');
  Object.defineProperty(frame.element, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
  Object.defineProperty(frame.element, 'setPointerCapture', { value: () => {} });
  await wrapper.get('[data-handle="n"]').trigger('pointerdown', { clientX: 20, clientY: 10, pointerId: 1 });
  await frame.trigger('pointermove', { clientX: 20, clientY: 5, pointerId: 1 });
  expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual({ x: 10, y: 5, width: 30, height: 15 });
  wrapper.unmount();
});

it('shows full-image handles and numeric controls before a crop is drawn', async () => {
  const wrapper = mount(ImageStage, { props: { mode: 'crop', width: 100, height: 50, checkerboard: true } });
  expect(wrapper.findAll('[data-handle]')).toHaveLength(8);
  expect((wrapper.get('input[aria-label="Crop width"]').element as HTMLInputElement).value).toBe('100');
  expect(wrapper.emitted('update:value')).toBeUndefined();
  wrapper.unmount();
});

it('zooms to a fixed scale, keeps pointer mapping in natural pixels, and steps with Ctrl+wheel', async () => {
  const wrapper = mount(ImageStage, { props: { mode: 'region', width: 100, height: 50, checkerboard: false } });
  const frame = wrapper.get('[data-frame]');
  expect(frame.attributes('style') ?? '').toBe('');
  await wrapper.get('[role="radiogroup"][aria-label="Zoom"] button[value="2"]').trigger('click');
  expect(frame.attributes('style')).toContain('width: 200px');
  expect(frame.attributes('style')).toContain('height: 100px');
  Object.defineProperty(frame.element, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 200, height: 100 }) });
  Object.defineProperty(frame.element, 'setPointerCapture', { value: () => {} });
  await frame.trigger('pointerdown', { clientX: 40, clientY: 20, pointerId: 1 });
  await frame.trigger('pointermove', { clientX: 60, clientY: 30, pointerId: 1 });
  expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual({ x: 20, y: 10, width: 11, height: 6 });
  await wrapper.get('[data-stage]').trigger('wheel', { ctrlKey: true, deltaY: -100 });
  expect(frame.attributes('style')).toContain('width: 400px');
  await wrapper.get('[data-stage]').trigger('wheel', { ctrlKey: true, deltaY: 100 });
  await wrapper.get('[data-stage]').trigger('wheel', { ctrlKey: true, deltaY: 100 });
  await wrapper.get('[data-stage]').trigger('wheel', { ctrlKey: true, deltaY: 100 });
  expect(frame.attributes('style') ?? '').toBe('');
  wrapper.unmount();
});
