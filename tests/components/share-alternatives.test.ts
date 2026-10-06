import { expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import type { ShareAlternative } from '@not3/sdk';
import ShareAlternatives from '~/components/dialog/share-alternatives.vue';
import { ShareAlternativesDialog } from '~/lib/dialog';

it('renders the SDK labels, descriptions and exact copyable values', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  const alternatives: ShareAlternative[] = [
    { id: 'ui', label: 'Link', description: 'Open this link in a browser.', value: 'https://not-th.re/q/id#fragment' },
    { id: 'cli', label: 'CLI', description: 'Needs the not3 CLI.', value: "not3 note get id --seed 'a b'" },
  ];
  const wrapper = mount(ShareAlternatives, { props: { data: new ShareAlternativesDialog(alternatives) } });
  expect(wrapper.findAll('[data-share-alternative]')).toHaveLength(2);
  expect(wrapper.text()).toContain('Open this link in a browser.');
  expect(wrapper.text()).toContain('Needs the not3 CLI.');
  expect(wrapper.findAll('code').map(code => code.text())).toEqual(alternatives.map(row => row.value));
  await wrapper.findAll('button')[1].trigger('click');
  expect(writeText).toHaveBeenCalledExactlyOnceWith("not3 note get id --seed 'a b'");
  wrapper.unmount();
  vi.unstubAllGlobals();
});
