import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { SvelteRunner } from "~/lib/sandbox/runners/svelte";

const ORIGIN = "https://app.example";

describe("SvelteRunner", () => {
  it("is the default engine for svelte notes and allows blob modules", () => {
    expect(defaultRunnerForLanguage("svelte")?.id).toBe("svelte");
    expect(SvelteRunner.scriptBlob).toBe(true);
  });

  it("ships an import map for bare svelte specifiers and the local compiler", () => {
    const doc = buildSrcdoc({
      runner: SvelteRunner, content: "<h1>hi</h1>", token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain('<script type="importmap">');
    expect(doc).toContain(`${ORIGIN}/vendor/svelte/src/index-client.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/svelte/src/internal/client/index.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/svelte/compiler/index.js`);
    expect(doc.match(/script-src [^;]*/)![0]).toContain("blob:");
  });
});
