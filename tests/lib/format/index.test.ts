import { describe, expect, it } from "vitest";
import { format, hasFormatter } from "~/lib/format";

describe("format", () => {
  const cases: Array<[string, string, string]> = [
    ["json", '{"a":1,\n"b":2}', '{\n  "a": 1,\n  "b": 2\n}\n'],
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
    ["xml", "<root><item>Hi</item></root>", "<root>\n  <item>Hi</item>\n</root>\n"],
    ["sql", "select id,name from users where id=1;", "SELECT\n  id,\n  name\nFROM\n  users\nWHERE\n  id = 1;"],
  ];

  it.each(cases)("formats %s", async (language, source, expected) => {
    expect(hasFormatter(language)).toBe(true);
    expect(await format(language, source, { tabWidth: 2 })).toBe(expected);
  });

  it("uses the configured tab width", async () => {
    expect(await format("json", '{"a":1,\n"b":2}', { tabWidth: 4 })).toBe('{\n    "a": 1,\n    "b": 2\n}\n');
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

  it("rejects an unknown language", async () => {
    expect(hasFormatter("python")).toBe(false);
    await expect(format("python", "print(1)", { tabWidth: 2 })).rejects.toThrow(/formatter/i);
  });

  it("rejects invalid syntax", async () => {
    await expect(format("json", '{"a":', { tabWidth: 2 })).rejects.toThrow();
  });
});
