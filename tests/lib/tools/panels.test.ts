import { beforeEach, expect, it, vi } from 'vitest';
import { createPinia, defineStore, setActivePinia } from 'pinia';
vi.stubGlobal('defineStore', defineStore);
const { useAppStore } = await import('~/stores/app');

beforeEach(() => setActivePinia(createPinia()));

it('opens only one side panel and keeps sandbox assignment compatible', () => {
  const store = useAppStore();
  expect(store.sidePanel).toBeNull();
  store.sandbox = true;
  expect(store.sidePanel).toBe('sandbox');
  store.sidePanel = 'tools';
  expect(store.sandbox).toBe(false);
  store.sandbox = true;
  expect(store.sidePanel).toBe('sandbox');
  store.sandbox = false;
  expect(store.sidePanel).toBeNull();
});
