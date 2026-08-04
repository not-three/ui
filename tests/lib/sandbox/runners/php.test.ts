import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { PhpRunner } from "~/lib/sandbox/runners/php";

const ORIGIN = "https://app.example";

describe("PhpRunner", () => {
  it("is the default engine for php notes, heavy, preview layout", () => {
    expect(defaultRunnerForLanguage("php")?.id).toBe("php-wasm");
    expect(PhpRunner.heavy).toBe(true);
    expect(PhpRunner.layout).toBe("preview");
  });

  // The brief's original assertion checked for a <script type="text/php">
  // tag loaded via php-tags.mjs. That tag-scanning mechanism turned out to
  // silently discard all output (see lib/sandbox/runners/php.ts for the
  // full explanation), so this runner imports the PhpWeb class directly
  // instead; the assertions below verify that actual mechanism.
  it("loads the self-hosted PhpWeb module and embeds the note as code to run", () => {
    const doc = buildSrcdoc({
      runner: PhpRunner, content: "<?php echo 6 * 7;", token: "tok",
      allowNetwork: false, origin: ORIGIN,
    });
    expect(doc).toContain(`${ORIGIN}/vendor/php-wasm/PhpWeb.mjs`);
    expect(doc).toContain("new PhpWeb()");
    expect(doc).toContain("echo 6 * 7;");
  });
});
