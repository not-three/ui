import { describe, expect, it } from "vitest";
import { format, hasFormatter } from "~/lib/format";

describe("format", () => {
  const cases: Array<[string, string, string]> = [
    ["json", '{"a":1}', '{ "a": 1 }\n'],
    ["yaml", "name: test\nitems: [a,b]", "name: test\nitems: [a, b]\n"],
    ["dockercompose", "services:\n  web: {image: nginx}", "services:\n  web: { image: nginx }\n"],
    ["html", "<div><span>Hi</span></div>", "<div><span>Hi</span></div>\n"],
    ["css", "a{color:red}", "a {\n  color: red;\n}\n"],
    ["scss", "$color:red;a{color:$color}", "$color: red;\na {\n  color: $color;\n}\n"],
    ["less", "@color:red;a{color:@color}", "@color: red;\na {\n  color: @color;\n}\n"],
    ["javascript", "const x={a:1}", "const x = { a: 1 };\n"],
    ["typescript", "const x:number=1", "const x: number = 1;\n"],
    ["jsx", "const x=<div>Hello</div>", "const x = <div>Hello</div>;\n"],
    ["vue", "<template><div><span>Hi</span><span>Bye</span></div></template>", "<template>\n  <div><span>Hi</span><span>Bye</span></div>\n</template>\n"],
    ["markdown", "# Title\n\n- one\n- two", "# Title\n\n- one\n- two\n"],
    ["graphql", "query Test{user{id}}", "query Test {\n  user {\n    id\n  }\n}\n"],
    ["xml", "<root><item>Hi</item></root>", "<root><item>Hi</item></root>\n"],
    ["sql", "select id,name from users where id=1;", "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  id = 1;"],
  ];

  it.each(cases)("formats %s", async (language, source, expected) => {
    expect(hasFormatter(language)).toBe(true);
    expect(await format(language, source, { tabWidth: 2 })).toBe(expected);
  });

  it("uses the configured tab width", async () => {
    expect(await format("css", "a{color:red}", { tabWidth: 4 })).toBe("a {\n    color: red;\n}\n");
  });

  it("uses Prettier's default line width", async () => {
    const source = '{"items":["' + "a".repeat(40) + '","' + "b".repeat(40) + '"]}';
    expect(await format("json", source, { tabWidth: 2 })).toBe(
      '{\n  "items": [\n    "' + "a".repeat(40) + '",\n    "' + "b".repeat(40) + '"\n  ]\n}\n',
    );
  });

  it("uses PostgreSQL grammar when the PGlite runner is selected", async () => {
    expect(await format("sql", "select $$hello world$$ as body;", {
      tabWidth: 2,
      sqlDialect: "postgresql",
    })).toBe("SELECT\n  $$hello world$$ AS body;");
  });

  it("preserves significant whitespace in mixed XML content", async () => {
    expect(await format("xml", "<p>Hello <b>world</b>!</p>", { tabWidth: 2 })).toBe(
      "<p>Hello <b>world</b>!</p>\n",
    );
  });

  it("formats TypeScript inside a Vue single-file component", async () => {
    expect(await format("vue", '<template><div>Hi</div></template><script lang="ts">const x:number=1</script>', { tabWidth: 2 })).toBe(
      '<template><div>Hi</div></template>\n<script lang="ts">\nconst x: number = 1;\n</script>\n',
    );
  });

  it("formats embedded JavaScript and CSS in HTML", async () => {
    expect(await format("html", "<html><script>const x=1</script><style>a{color:red}</style></html>", { tabWidth: 2 })).toBe(
      "<html>\n  <script>\n    const x = 1;\n  </script>\n  <style>\n    a {\n      color: red;\n    }\n  </style>\n</html>\n",
    );
  });

  it("rejects an unknown language", async () => {
    expect(hasFormatter("python")).toBe(false);
    await expect(format("python", "print(1)", { tabWidth: 2 })).rejects.toThrow(/formatter/i);
  });

  it("rejects invalid syntax", async () => {
    await expect(format("json", '{"a":', { tabWidth: 2 })).rejects.toThrow();
  });
});
