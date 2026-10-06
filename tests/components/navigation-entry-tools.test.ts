import { expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, onMounted, onUnmounted } from 'vue';
vi.stubGlobal('ref', ref);
vi.stubGlobal('onMounted', onMounted);
vi.stubGlobal('onUnmounted', onUnmounted);
const { default: NavigationEntry } = await import('~/components/navigation/entry.vue');

it('opens and activates a nested tool using keyboard controls', async () => {
  const run = vi.fn();
  const wrapper = mount(NavigationEntry, {
    props: { config: { name: 'Tools', entries: [{ name: 'Encode', entries: [{ name: 'Base64', onClick: run }] }] } },
    global: { stubs: { TransitionFade: { template: '<div><slot /></div>' } } },
  });
  const heading = wrapper.get('h2');
  expect(heading.attributes('tabindex')).toBe('0');
  await heading.trigger('keydown.enter');
  await wrapper.get('button[aria-expanded="false"]').trigger('click');
  const base64 = wrapper.findAll('button').find(button => button.text() === 'Base64');
  expect(base64).toBeDefined();
  await base64!.trigger('click');
  expect(run).toHaveBeenCalledOnce();
  wrapper.unmount();
});

it('keeps only one category submenu open and turns its marker downwards', async () => {
  const wrapper = mount(NavigationEntry, {
    props: { config: { name: 'Tools', entries: [
      { name: 'Encode', entries: [{ name: 'Base64', onClick: vi.fn() }] },
      { name: 'Crypto', entries: [{ name: 'AES', onClick: vi.fn() }] },
    ] } },
    global: { stubs: { TransitionFade: { template: '<div><slot /></div>' } } },
  });
  await wrapper.get('h2').trigger('click');
  const category = (name: string) => wrapper.findAll('button').find(button => button.text() === `${name} ▸`)!;
  await category('Encode').trigger('click');
  expect(category('Encode').attributes('aria-expanded')).toBe('true');
  expect(category('Encode').find('.rotate-90').exists()).toBe(true);
  await category('Crypto').trigger('click');
  expect(category('Encode').attributes('aria-expanded')).toBe('false');
  expect(category('Encode').find('.rotate-90').exists()).toBe(false);
  expect(category('Crypto').attributes('aria-expanded')).toBe('true');
  expect(wrapper.findAll('button').some(button => button.text() === 'Base64')).toBe(false);
  expect(wrapper.findAll('button').some(button => button.text() === 'AES')).toBe(true);
  wrapper.unmount();
});
