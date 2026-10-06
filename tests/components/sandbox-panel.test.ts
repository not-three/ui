import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { SANDBOX_CONSOLE_MESSAGE } from "~/lib/sandbox/protocol";

vi.mock("~/lib/sandbox/srcdoc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/lib/sandbox/srcdoc")>();
  return { ...actual, buildSrcdoc: vi.fn(actual.buildSrcdoc) };
});

// Nuxt supplies these auto imports in the app; provide them when mounting the
// actual panel SFC in Vitest.
for (const [name, value] of Object.entries({
  computed, nextTick, onBeforeUnmount, onMounted, ref, watch,
})) vi.stubGlobal(name, value);
vi.stubGlobal("useRuntimeConfig", () => ({ public: { uiBaseURL: "/" } }));

const { default: SandboxPanel } = await import("~/components/editor/sandbox-panel.vue");

afterEach(() => vi.clearAllTimers());

describe("sandbox panel language changes", () => {
  it("rebuilds the selected data tables runner when only the language changes", async () => {
    const wrapper = mount(SandboxPanel, {
      props: { content: '[{"id":1}]', languageId: "markdown" },
      global: { stubs: { "editor-sandbox-tables": true } },
    });
    try {
      await wrapper.get("select").setValue("data-tables");
      expect(wrapper.get("iframe").attributes("srcdoc")).toContain('var language = "markdown"');

      await wrapper.setProps({ languageId: "json" });
      await nextTick();

      expect(wrapper.get("iframe").attributes("srcdoc")).toContain('var language = "json"');
    } finally {
      wrapper.unmount();
    }
  });

  it("clears the previous document on a language-only switch when auto-run is off", async () => {
    const wrapper = mount(SandboxPanel, {
      props: { content: '[{"id":1}]', languageId: "markdown" },
      global: { stubs: { "editor-sandbox-tables": true } },
    });
    try {
      await wrapper.get("select").setValue("data-tables");
      await wrapper.get('input[type="checkbox"]').setValue(false);
      expect(wrapper.get("iframe").attributes("srcdoc")).toContain('var language = "markdown"');

      await wrapper.setProps({ languageId: "json" });
      expect(wrapper.get("iframe").attributes("srcdoc")).toBe("");

      await wrapper.findAll("button").find(button => button.text() === "Run")!.trigger("click");
      expect(wrapper.get("iframe").attributes("srcdoc")).toContain('var language = "json"');
    } finally {
      wrapper.unmount();
    }
  });

  it("rejects old iframe messages and cancels table retries after a manual language switch", async () => {
    vi.useFakeTimers();
    const wrapper = mount(SandboxPanel, {
      props: { content: '[{"id":1}]', languageId: "markdown" },
      global: { stubs: { "editor-sandbox-tables": true } },
    });
    try {
      await wrapper.get("select").setValue("data-tables");
      const oldToken = vi.mocked(buildSrcdoc).mock.lastCall?.[0].token;
      expect(oldToken).toBeTruthy();
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      await wrapper.get('input[type="checkbox"]').setValue(false);

      await wrapper.setProps({ languageId: "json" });
      expect(wrapper.get("iframe").attributes("srcdoc")).toBe("");
      expect(vi.getTimerCount()).toBe(0);

      const frame = wrapper.get("iframe").element as HTMLIFrameElement;
      window.dispatchEvent(new MessageEvent("message", {
        source: frame.contentWindow,
        data: { type: SANDBOX_CONSOLE_MESSAGE, token: oldToken, level: "error", args: ["stale error"] },
      }));
      await nextTick();
      expect(wrapper.text()).not.toContain("stale error");
    } finally {
      wrapper.unmount();
      vi.useRealTimers();
    }
  });

  it("runs once when changing language also changes the selected runner", async () => {
    const wrapper = mount(SandboxPanel, {
      props: { content: '[{"id":1}]', languageId: "markdown" },
      global: { stubs: { "editor-sandbox-tables": true } },
    });
    try {
      vi.mocked(buildSrcdoc).mockClear();
      await wrapper.setProps({ languageId: "json" });
      await nextTick();

      expect(vi.mocked(buildSrcdoc)).toHaveBeenCalledTimes(1);
      expect(wrapper.get("iframe").attributes("srcdoc")).toContain('var language = "json"');
    } finally {
      wrapper.unmount();
    }
  });
});
