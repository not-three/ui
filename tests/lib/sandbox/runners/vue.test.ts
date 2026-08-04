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
    expect(doc).toContain(`${ORIGIN}/vendor/vue/vue.global.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/vue/vue3-sfc-loader.js`);
    expect(doc).toContain("loadModule");
    expect(doc).toContain("{{ msg }}");
  });

  // The prod build strips every runtime warning, which made broken notes
  // (e.g. @click bound to a method that does not exist) fail silently.
  it("loads the dev build and installs warn/error handlers", () => {
    const doc = VueRunner.build({ content: "<template><p/></template>", vendorBase: "v" });
    expect(doc.head).toContain("vue.global.js");
    expect(doc.head).not.toContain("vue.global.prod.js");
    expect(doc.body).toContain("config.warnHandler");
    expect(doc.body).toContain("config.errorHandler");
  });
});
