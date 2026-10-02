export interface FormatOptions {
  tabWidth: number;
  sqlDialect?: "sql" | "postgresql";
}

type PrettierParser =
  | "json" | "yaml" | "html" | "css" | "scss" | "less"
  | "babel" | "typescript" | "vue" | "markdown" | "graphql" | "xml";

const parsers: Record<string, PrettierParser> = {
  json: "json",
  yaml: "yaml",
  dockercompose: "yaml",
  html: "html",
  css: "css",
  scss: "scss",
  less: "less",
  javascript: "babel",
  typescript: "typescript",
  jsx: "babel",
  vue: "vue",
  markdown: "markdown",
  graphql: "graphql",
  xml: "xml",
};

export function hasFormatter(languageId: string): boolean {
  return languageId === "sql" || Object.hasOwn(parsers, languageId);
}

export async function format(languageId: string, source: string, opts: FormatOptions): Promise<string> {
  if (languageId === "sql") {
    const { format: formatSql } = await import("sql-formatter");
    return formatSql(source, {
      language: opts.sqlDialect === "postgresql" ? "postgresql" : "sql",
      tabWidth: opts.tabWidth,
      keywordCase: "upper",
    });
  }

  const parser = parsers[languageId];
  if (!parser) throw new Error(`No formatter for ${languageId}`);

  const [{ format: prettierFormat }, plugins] = await Promise.all([
    import("prettier/standalone"),
    loadPlugins(parser),
  ]);
  return prettierFormat(source, {
    parser,
    plugins,
    tabWidth: opts.tabWidth,
    useTabs: false,
    printWidth: 100,
  });
}

async function loadPlugins(parser: PrettierParser) {
  switch (parser) {
    case "json": return [await import("prettier/plugins/estree"), await import("prettier/plugins/babel")];
    case "yaml": return [await import("prettier/plugins/yaml")];
    case "html":
    case "vue": return Promise.all([
      import("prettier/plugins/html"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/typescript"),
      import("prettier/plugins/postcss"),
    ]);
    case "css":
    case "scss":
    case "less": return [await import("prettier/plugins/postcss")];
    case "babel": return [await import("prettier/plugins/estree"), await import("prettier/plugins/babel")];
    case "typescript": return [await import("prettier/plugins/estree"), await import("prettier/plugins/typescript")];
    case "markdown": return [await import("prettier/plugins/markdown")];
    case "graphql": return [await import("prettier/plugins/graphql")];
    case "xml": return [(await import("@prettier/plugin-xml")).default];
  }
}
