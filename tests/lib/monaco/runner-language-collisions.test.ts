import { describe, expect, it } from "vitest";
import { detectLanguageFromContent } from "~/lib/monaco/utils";

// The "Run / Preview" panel (feat/sandboxed-runner-preview) picks a runner
// straight from detectLanguageFromContent's verdict, so a misdetection no
// longer just disables a button — it now executes the note through the
// wrong interpreter. This suite pins down the specific collisions found by
// review (plain JS mis-detected as lua/less) plus a representative sample of
// every language that has a real sandbox runner, so a future language
// definition can't silently hijack notes from another one again.
describe("runner language collisions", () => {
  it("detects a plain JS function declaration as javascript, not lua", () => {
    const js = [
      'function greet(name) {',
      '  return "hi " + name;',
      '}',
      'console.log(greet("world"));',
    ].join("\n");
    expect(detectLanguageFromContent(js)).toBe("javascript");
  });

  it("detects plain DOM/console JS as javascript, not less", () => {
    const js = [
      'const el = document.querySelector("#x");',
      'el.className = "active";',
      "console.log(el);",
    ].join("\n");
    expect(detectLanguageFromContent(js)).toBe("javascript");
  });

  it("detects real Lua as lua", () => {
    const lua = [
      "function greet(name)",
      '  local msg = "hello " .. name',
      "  print(msg)",
      "end",
      "",
      'greet("world")',
    ].join("\n");
    expect(detectLanguageFromContent(lua)).toBe("lua");
  });

  it("detects real Python as python", () => {
    const python = [
      "def greet(name):",
      '    return f"hi {name}"',
      "",
      'print(greet("world"))',
    ].join("\n");
    expect(detectLanguageFromContent(python)).toBe("python");
  });

  it("detects real Ruby as ruby", () => {
    const ruby = [
      "require 'json'",
      "def greet(name)",
      '  puts "hello #{name}"',
      "end",
      "",
      "[1, 2].each do |n|",
      "  puts n",
      "end",
    ].join("\n");
    expect(detectLanguageFromContent(ruby)).toBe("ruby");
  });

  it("detects real CoffeeScript as coffeescript", () => {
    const coffee = [
      "greet = (name) ->",
      '  console.log "hello #{name}"',
      "",
      'greet "world"',
    ].join("\n");
    expect(detectLanguageFromContent(coffee)).toBe("coffeescript");
  });

  it("detects real React/JSX as jsx", () => {
    const jsx = [
      'import React, { useState } from "react";',
      "",
      "function App() {",
      "  const [count, setCount] = useState(0);",
      "  return (",
      '    <Layout title="Counter">',
      '      <Button className="primary" onClick={() => setCount(count + 1)}>',
      "        Count: {count}",
      "      </Button>",
      "    </Layout>",
      "  );",
      "}",
      "",
      "export default App;",
    ].join("\n");
    expect(detectLanguageFromContent(jsx)).toBe("jsx");
  });

  it("detects real Mermaid as mermaid", () => {
    const mermaid = [
      "graph TD",
      "  A[Start] --> B{Is it working?}",
      "  B -->|Yes| C[Great!]",
      "  B -->|No| D[Debug]",
    ].join("\n");
    expect(detectLanguageFromContent(mermaid)).toBe("mermaid");
  });

  // A realistic Vue SFC — template markup with a real element (not just a
  // bare interpolation), a <script setup lang="ts"> block with an import
  // and reactive state, and a scoped <style> block. Previously this class
  // of "ordinary, decorated" SFC lost to xml.ts's generic tag-counting
  // patterns; xml.ts was fixed (see lib/monaco/languages/xml.ts) rather than
  // trimming this sample down to make it pass.
  it("detects a realistic Vue SFC as vue", () => {
    const vue = [
      "<template>",
      '  <div class="counter">',
      '    <button class="btn" @click="increment">Count: {{ count }}</button>',
      "  </div>",
      "</template>",
      "",
      '<script setup lang="ts">',
      'import { ref } from "vue";',
      "",
      "defineProps({ label: String });",
      "const count = ref(0);",
      "function increment() {",
      "  count.value++;",
      "}",
      "</script>",
      "",
      "<style scoped>",
      ".counter {",
      "  display: flex;",
      "}",
      "</style>",
    ].join("\n");
    expect(detectLanguageFromContent(vue)).toBe("vue");
  });

  // A realistic Svelte component — runes-style local state, an {#if} block,
  // an on:click directive and a <style> block with real markup around them.
  // Same rationale as the Vue case above: previously lost to xml.ts's
  // generic tag counting; fixed at the xml.ts source, not by trimming this
  // sample.
  it("detects a realistic Svelte component as svelte", () => {
    const svelte = [
      "<script>",
      "  let count = $state(0);",
      "",
      "  function increment() {",
      "    count += 1;",
      "  }",
      "</script>",
      "",
      "<button on:click={increment}>",
      "  Count: {count}",
      "</button>",
      "",
      "{#if count > 5}",
      "  <p>That's a lot of clicks!</p>",
      "{/if}",
      "",
      "<style>",
      "  button {",
      "    background: royalblue;",
      "    color: white;",
      "    padding: 0.5rem 1rem;",
      "  }",
      "</style>",
    ].join("\n");
    expect(detectLanguageFromContent(svelte)).toBe("svelte");
  });

  // A realistic full HTML page — the shape xml.ts's old generic tag-pair
  // patterns previously beat outright (measured 10 for html vs. 23 for xml
  // before the xml.ts fix).
  it("detects a realistic HTML page as html", () => {
    const html = [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      "  <title>My Page</title>",
      '  <link rel="stylesheet" href="style.css">',
      "</head>",
      "<body>",
      "  <header>",
      "    <h1>Welcome</h1>",
      "    <nav>",
      '      <a href="/">Home</a>',
      '      <a href="/about">About</a>',
      "    </nav>",
      "  </header>",
      "  <main>",
      '    <div id="app">',
      "      <p>Hello, world!</p>",
      '      <img src="logo.png" alt="logo">',
      '      <input type="text" placeholder="Search">',
      "    </div>",
      "  </main>",
      '  <script src="app.js"></script>',
      "</body>",
      "</html>",
    ].join("\n");
    expect(detectLanguageFromContent(html)).toBe("html");
  });

  // A minimal HTML fragment (no doctype/html/head/body wrapper) — the case
  // that most starkly showed the bug: html.ts only scores off a couple of
  // its own specific tags here, so it used to lose even to a small amount
  // of xml.ts's generic tag counting.
  it("detects a minimal HTML fragment as html", () => {
    const html = [
      '<div class="card">',
      '  <img src="thumb.jpg" alt="thumb">',
      "  <h2>Title</h2>",
      '  <p>Some text. <a href="/more">Read more</a></p>',
      "</div>",
    ].join("\n");
    expect(detectLanguageFromContent(html)).toBe("html");
  });

  // Real XML: a declaration/prolog plus xmlns and xmlns:-prefixed elements
  // — exactly the signals xml.ts's fix leans on instead of raw tag counting.
  it("detects real XML (with prolog and xmlns) as xml", () => {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<catalog xmlns="http://example.com/catalog" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      '  <book id="bk101">',
      "    <dc:title>XML Developer's Guide</dc:title>",
      "    <dc:creator>Gambardella, Matthew</dc:creator>",
      "    <price>44.95</price>",
      "  </book>",
      "</catalog>",
    ].join("\n");
    expect(detectLanguageFromContent(xml)).toBe("xml");
  });
});

// NOT COVERED: a bare, prolog-free, namespace-free, DTD-free XML document
// (e.g. `<catalog><book><title>A</title></book></catalog>`) may now detect
// as "html" instead of "xml", since xml.ts no longer scores generic tag
// soup highly enough to beat html.ts's own patterns. This is an accepted,
// explicit tradeoff: both are markup, xml has no sandbox runner either way,
// and the misdetection costs nothing — whereas the previous behaviour
// actively cost the html/vue/svelte runners their auto-detection on any
// ordinarily-decorated document. Not worth a regression test since the
// "right" answer here is a judgment call, not a bug.
