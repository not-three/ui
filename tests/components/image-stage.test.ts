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
  const frame = wrapper.get('[tabindex="0"]');
  Object.defineProperty(frame.element, 'getBoundingClientRect', { value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
  Object.defineProperty(frame.element, 'setPointerCapture', { value: () => {} });
  await wrapper.get('[data-handle="n"]').trigger('pointerdown', { clientX: 20, clientY: 10, pointerId: 1 });
  await frame.trigger('pointermove', { clientX: 20, clientY: 5, pointerId: 1 });
  expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual({ x: 10, y: 5, width: 30, height: 15 });
  wrapper.unmount();
});
