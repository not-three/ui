import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { VueRunner } from "~/lib/sandbox/runners/vue";

const ORIGIN = "https://app.example";

describe("VueRunner", () => {
  it("is the default engine for vue notes", () => {
    expect(defaultRunnerForLanguage("vue")?.id).toBe("vue-sfc");
    expect(VueRunner.layout).toBe("preview");
  });

  it("loads self-hosted vue + sfc-loader and embeds the SFC source", () => {
    const doc = buildSrcdoc({
      runner: VueRunner, content: "<template><h1>{{ msg }}</h1></template>",
      token: "tok", allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(`${ORIGIN}/vendor/vue/vue.global.prod.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/vue/vue3-sfc-loader.js`);
    expect(doc).toContain("loadModule");
    expect(doc).toContain("{{ msg }}");
  });
});
