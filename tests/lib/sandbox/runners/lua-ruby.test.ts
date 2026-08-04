import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "~/lib/sandbox/srcdoc";
import { defaultRunnerForLanguage } from "~/lib/sandbox/runners";
import { LuaRunner } from "~/lib/sandbox/runners/lua";
import { RubyRunner } from "~/lib/sandbox/runners/ruby";

const ORIGIN = "https://app.example";
const OPTS = { token: "tok", allowNetwork: false, origin: ORIGIN };

describe("LuaRunner", () => {
  it("is the default engine for lua notes", () => {
    expect(defaultRunnerForLanguage("lua")?.id).toBe("lua-wasmoon");
  });

  it("imports self-hosted wasmoon and points at the local glue wasm", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: LuaRunner, content: "print(1)" });
    expect(doc).toContain(`${ORIGIN}/vendor/wasmoon/index.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/wasmoon/glue.wasm`);
  });
});

describe("RubyRunner", () => {
  it("is the default engine for ruby notes and is marked heavy", () => {
    expect(defaultRunnerForLanguage("ruby")?.id).toBe("ruby-wasm");
    expect(RubyRunner.heavy).toBe(true);
  });

  it("loads the CDN-free UMD entry and the local wasm, never the iife entry", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: RubyRunner, content: 'puts "</script>"' });
    expect(doc).toContain(`${ORIGIN}/vendor/ruby-wasm/browser.umd.js`);
    expect(doc).toContain(`${ORIGIN}/vendor/ruby-wasm/ruby+stdlib.wasm`);
    // browser.script.iife.js fetches from cdn.jsdelivr.net on load — banned.
    expect(doc).not.toContain("browser.script.iife.js");
    expect(doc).not.toContain("jsdelivr");
  });

  it("embeds the note JSON-escaped so it cannot break out of the script", () => {
    const doc = buildSrcdoc({ ...OPTS, runner: RubyRunner, content: 'puts "</script>"' });
    expect(doc).not.toContain('puts "</script>"');
    expect(doc).toContain("DefaultRubyVM");
  });
});
