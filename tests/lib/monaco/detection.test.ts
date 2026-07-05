import { describe, expect, it } from "vitest";
import { detectLanguageFromContent } from "~/lib/monaco/utils";
import { languageDefinitions } from "~/lib/monaco/languages";

const NEW_IDS = [
  "css", "scss", "less", "rust", "ruby", "csharp", "kotlin", "swift",
  "dart", "lua", "perl", "r", "powershell", "dockerfile", "graphql",
];

describe("expanded language registry", () => {
  it("registers all new languages exactly once", () => {
    const ids = languageDefinitions.map((l) => l.id);
    for (const id of NEW_IDS) {
      expect(ids.filter((x) => x === id)).toHaveLength(1);
    }
  });

  it("gives every language a display alias and a mime type", () => {
    for (const lang of languageDefinitions) {
      expect(lang.aliases?.[0], lang.id).toBeTruthy();
      expect(lang.mimeTypes?.[0], lang.id).toBeTruthy();
    }
  });
});

describe("detection of new languages", () => {
  const cases: Record<string, string> = {
    css: [
      ".button {",
      "  color: red;",
      "  background-color: #fff !important;",
      "}",
      "@media (max-width: 600px) {",
      "  .button { display: none; }",
      "}",
    ].join("\n"),
    scss: [
      "$primary: #333;",
      "@mixin center { display: flex; }",
      ".card {",
      "  color: $primary;",
      "  &:hover { color: red; }",
      "}",
    ].join("\n"),
    rust: [
      "use std::collections::HashMap;",
      "fn main() {",
      "    let mut map = HashMap::new();",
      '    println!("{:?}", map);',
      "}",
    ].join("\n"),
    ruby: [
      "require 'json'",
      "def greet(name)",
      '  puts "hello #{name}"',
      "end",
      "[1, 2].each do |n|",
      "  puts n",
      "end",
    ].join("\n"),
    csharp: [
      "using System;",
      "namespace Demo {",
      "  public class Program {",
      "    public static void Main() {",
      '      Console.WriteLine("hi");',
      "    }",
      "  }",
      "}",
    ].join("\n"),
    powershell: [
      "param([string]$Name)",
      "$items = Get-ChildItem -Path .",
      "if ($Name -eq 'x') {",
      "  Write-Output $items",
      "}",
    ].join("\n"),
    dockerfile: [
      "FROM node:22-alpine",
      "WORKDIR /app",
      "COPY . .",
      "RUN npm ci",
      'CMD ["node", "index.js"]',
    ].join("\n"),
    graphql: [
      "query GetUser($id: ID!) {",
      "  user(id: $id) {",
      "    name",
      "    email",
      "  }",
      "}",
      "fragment Basic on User {",
      "  id",
      "}",
    ].join("\n"),
  };

  for (const [expected, snippet] of Object.entries(cases)) {
    it(`detects ${expected}`, () => {
      expect(detectLanguageFromContent(snippet)).toBe(expected);
    });
  }

  it('does not misdetect a JS "use strict" directive as perl', () => {
    const js = ['"use strict";', "var x = 1;", "foo(x);"].join("\n");
    expect(detectLanguageFromContent(js)).not.toBe("perl");
  });
});
