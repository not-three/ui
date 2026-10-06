import{$ as e,$t as t,At as n,Dt as r,Ft as i,L as a,Mt as o,Ut as s,Yt as c,Z as l,_t as u,ct as d,dn as f,dt as p,et as ee,ft as m,it as h,ln as g,lt as _,mt as v,nt as te,on as y,rt as b,tt as ne,un as re,ut as ie,wt as ae,zt as x}from"./C61trjtR.js";import{t as oe}from"./DUXuJjpR.js";function S(e){return JSON.stringify(e).replace(/</g,`\\u003c`).replace(/\u2028/g,`\\u2028`).replace(/\u2029/g,`\\u2029`)}function se(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function ce(e){return e.replace(/<\/script/gi,`<\\/script`)}var le={id:`javascript`,label:`JavaScript`,languages:[`javascript`],layout:`console`,usesVendor:!1,build:({content:e})=>({body:`<script>${ce(e)}<\/script>`})},C={id:`html`,label:`HTML`,languages:[`html`],layout:`preview`,usesVendor:!1,build:({content:e})=>({bare:!0,body:e.replace(/^\s*<!doctype[^>]*>/i,``)})},w={markdown:`markdown/markdown.min.js`,papaParse:`papaparse/papaparse.min.js`,pyodide:`pyodide/pyodide.js`,pyodideIndex:`pyodide/`,wasmoon:`wasmoon/index.js`,wasmoonGlue:`wasmoon/glue.wasm`,sqlJs:`sql.js/sql-wasm.js`,sqlJsDir:`sql.js/`,pglite:`pglite/index.js`,typescript:`typescript/typescript.js`,coffeescript:`coffeescript/coffeescript.js`,babel:`babel/babel.min.js`,react:`react/react.production.min.js`,reactDom:`react/react-dom.production.min.js`,vue:`vue/vue.global.js`,vueSfcLoader:`vue/vue3-sfc-loader.js`,svelteCompiler:`svelte/compiler/index.js`,svelteIndexClient:`svelte/src/index-client.js`,svelteInternalClient:`svelte/src/internal/client/index.js`,svelteDiscloseVersion:`svelte/src/internal/disclose-version.js`,svelteFlagsLegacy:`svelte/src/internal/flags/legacy.js`,svelteClientConstants:`svelte/src/internal/client/constants.js`,svelteEsmEnv:`svelte/esm-env/index.js`,svelteEsmEnvBrowser:`svelte/esm-env/browser-fallback.js`,svelteEsmEnvDevelopment:`svelte/esm-env/dev-fallback.js`,svelteEsmEnvNode:`svelte/esm-env/false.js`,svelteClsx:`svelte/clsx/clsx.mjs`,rubyScript:`ruby-wasm/browser.umd.js`,rubyWasm:`ruby-wasm/ruby+stdlib.wasm`,phpWeb:`php-wasm/PhpWeb.mjs`,mermaid:`mermaid/mermaid.min.js`,jscpp:`jscpp/JSCPP.es5.min.js`,picoc:`picoc-js/bundle.umd.js`},T={id:`typescript`,label:`TypeScript`,languages:[`typescript`],layout:`console`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.typescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${S(e)};
  try {
    var js = ts.transpile(CODE, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None });
    (0, eval)(js);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},E={id:`coffeescript`,label:`CoffeeScript`,languages:[`coffeescript`],layout:`console`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.coffeescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${S(e)};
  try {
    (0, eval)(CoffeeScript.compile(CODE, { bare: true }));
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},D={id:`mermaid`,label:`Mermaid`,languages:[`mermaid`],layout:`preview`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.mermaid}"><\/script>`,body:`<pre class="mermaid">${se(e)}</pre>
<script>
try {
  mermaid.initialize({ startOnLoad: true, securityLevel: "strict", theme: "default" });
} catch (e) { console.error(String(e)); }
<\/script>`})},O=`<style>
html,body{margin:0;min-height:100%}
.markdown-preview{box-sizing:border-box;min-height:100vh;padding:24px max(24px,calc((100vw - 820px)/2));font:16px/1.65 system-ui,sans-serif;overflow-wrap:anywhere}
.markdown-preview[data-theme="dark"]{color-scheme:dark;background:#111;color:#e6e6e6}
.markdown-preview[data-theme="light"]{color-scheme:light;background:#fff;color:#222}
.markdown-preview a{color:#62a9ff}
.markdown-preview[data-theme="light"] a{color:#0969da}
.markdown-preview h1,.markdown-preview h2,.markdown-preview h3{line-height:1.3;margin:1.5em 0 .5em}
.markdown-preview h1{font-size:2em;border-bottom:1px solid #8885}
.markdown-preview h2{font-size:1.5em;border-bottom:1px solid #8885}
.markdown-preview table{border-collapse:collapse;display:block;overflow-x:auto;width:max-content;max-width:100%}
.markdown-preview th,.markdown-preview td{border:1px solid #8888;padding:6px 12px}
.markdown-preview tr:nth-child(even){background:#8882}
.markdown-preview pre{overflow-x:auto;padding:14px;border-radius:6px;background:#24292e;color:#e6edf3}
.markdown-preview[data-theme="light"] pre{background:#f6f8fa;color:#24292e}
.markdown-preview code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.markdown-preview :not(pre)>code{padding:2px 4px;border-radius:3px;background:#8883}
.markdown-preview .task-list-item{list-style:none}
.markdown-preview .task-list-item-checkbox{margin:0 .5em 0 -1.4em}
.markdown-preview .hljs-keyword,.markdown-preview .hljs-selector-tag{color:#c678dd}
.markdown-preview .hljs-string,.markdown-preview .hljs-attr{color:#98c379}
.markdown-preview .hljs-number,.markdown-preview .hljs-literal{color:#d19a66}
.markdown-preview[data-theme="light"] .hljs-keyword{color:#a626a4}
.markdown-preview[data-theme="light"] .hljs-string{color:#50a14f}
.markdown-preview .mermaid{background:transparent;text-align:center}
</style>`,k={id:`markdown-preview`,label:`Markdown preview`,languages:[`markdown`],layout:`preview`,usesVendor:!0,noRepl:!0,defaultTab:`console`,build:({content:e,vendorBase:t,theme:n})=>({head:`${O}<script src="${t}/${w.markdown}"><\/script><script src="${t}/${w.mermaid}"><\/script>`,body:`<main class="markdown-preview" data-theme="${n}"></main>
<script>
(function () {
  try {
    var tools = window.__not3Markdown;
    var md = new tools.MarkdownIt({
      html: false,
      linkify: true,
      typographer: false,
      highlight: function (code, language) {
        if (language && tools.hljs.getLanguage(language)) {
          try { return tools.hljs.highlight(code, { language: language }).value; }
          catch (e) { console.warn(String(e)); }
        }
        return md.utils.escapeHtml(code);
      }
    });
    md.use(tools.taskLists, { enabled: false });
    var slugCounts = Object.create(null);
    md.renderer.rules.heading_open = function (tokens, index, options, env, self) {
      var title = tokens[index + 1].content;
      var slug = title.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "")
        .replace(/[^a-z0-9 -]/g, "").trim().replace(/ +/g, "-") || "section";
      var count = slugCounts[slug] || 0;
      slugCounts[slug] = count + 1;
      tokens[index].attrSet("id", count ? slug + "-" + count : slug);
      return self.renderToken(tokens, index, options);
    };
    var originalFence = md.renderer.rules.fence;
    md.renderer.rules.fence = function (tokens, index, options, env, self) {
      var language = tokens[index].info.trim().split(/\\s+/)[0];
      if (language === "mermaid") {
        return '<pre class="mermaid">' + md.utils.escapeHtml(tokens[index].content) + '</pre>';
      }
      return originalFence(tokens, index, options, env, self);
    };
    var originalLink = md.renderer.rules.link_open;
    md.renderer.rules.link_open = function (tokens, index, options, env, self) {
      tokens[index].attrSet("target", "_blank");
      tokens[index].attrSet("rel", "noopener noreferrer");
      return originalLink ? originalLink(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
    };
    document.querySelector(".markdown-preview").innerHTML = md.render(${S(e)});
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: ${S(n===`dark`?`dark`:`default`)} });
    mermaid.run({ querySelector: ".markdown-preview .mermaid" }).catch(function (e) { console.error(String(e)); });
  } catch (e) { console.error(String(e)); }
})();
<\/script>`})},A={id:`react`,label:`React (Babel)`,languages:[`jsx`,`javascript`],layout:`preview`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.react}"><\/script><script src="${t}/${w.reactDom}"><\/script><script src="${t}/${w.babel}"><\/script>`,body:`<div id="root"></div>
<script>
(function () {
  var CODE = ${S(e)};
  try {
    // The react preset alone leaves ES module syntax untouched, so a note
    // starting with "export default function App()" is a SyntaxError for
    // eval/new Function. The commonjs transform rewrites import/export into
    // require/exports, which the shims below satisfy.
    // Babel 8 defaults the react preset to the automatic runtime, which
    // imports react/jsx-runtime; the UMD React globals only offer the
    // classic React.createElement API.
    var compiled = Babel.transform(CODE, {
      presets: [["react", { runtime: "classic" }]],
      plugins: ["transform-modules-commonjs"],
    }).code;
    var moduleShim = { exports: {} };
    var requireShim = function (name) {
      if (name === "react") return React;
      if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
      throw new Error("Cannot import \\"" + name + "\\": only react and react-dom exist in the sandbox");
    };
    // new Function gives the compiled CJS a private scope holding the shims;
    // the trailing return exposes a top-level \`function App() {}\` that never
    // went through exports (the pre-module-syntax style previously supported).
    var run = new Function(
      "require", "module", "exports",
      compiled + "\\n;return typeof App !== \\"undefined\\" ? App : undefined;",
    );
    var scopedApp = run(requireShim, moduleShim, moduleShim.exports);
    var App = moduleShim.exports.default || moduleShim.exports.App || scopedApp;
    var root = document.getElementById("root");
    if (root && !root.childNodes.length && App) {
      ReactDOM.createRoot(root).render(React.createElement(App));
    } else if (!App) {
      console.warn("No component found: export default one, or define function App() {}");
    }
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},j={id:`python-pyodide`,label:`Python (Pyodide)`,languages:[`python`],layout:`console`,usesVendor:!0,heavy:!0,replLanguage:`Python`,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.pyodide}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${S(e)};
  console.info("Loading Python (Pyodide)…");
  // Defined before the interpreter loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "Python is still loading…"; };
  try {
    var py = await loadPyodide({ indexURL: "${t}/${w.pyodideIndex}" });
    py.setStdout({ batched: function (s) { console.log(s); } });
    py.setStderr({ batched: function (s) { console.error(s); } });
    // The interpreter stays alive after the run, so the REPL shares the
    // note's globals. print(...) output already reaches the console above.
    window.__not3Eval__ = async function (code) {
      var replResult = await py.runPythonAsync(code);
      return replResult === undefined ? undefined : String(replResult);
    };
    // Loads wheels for imported packages from the local indexURL only.
    // Anything not vendored cannot be fetched (no external network), so say so.
    try {
      await py.loadPackagesFromImports(CODE);
    } catch (e) {
      console.warn(
        "Could not load an imported package offline. This sandbox ships the " +
        "Python standard library plus a small set of bundled packages; " +
        "others are unavailable. (" + String(e && e.message || e) + ")",
      );
    }
    var result = await py.runPythonAsync(CODE);
    if (result !== undefined) console.log(String(result));
  } catch (e) { console.error(String(e)); }
})();
<\/script>`})},M={id:`lua-wasmoon`,label:`Lua (wasmoon)`,languages:[`lua`],layout:`console`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.wasmoon}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${S(e)};
  console.info("Loading Lua (wasmoon)…");
  try {
    var factory = new wasmoon.LuaFactory("${t}/${w.wasmoonGlue}");
    var lua = await factory.createEngine();
    lua.global.set("print", function () {
      console.log(Array.prototype.slice.call(arguments).map(String).join("\\t"));
    });
    await lua.doString(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},N={id:`ruby-wasm`,label:`Ruby (ruby.wasm)`,languages:[`ruby`],layout:`console`,usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.rubyScript}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${S(e)};
  console.info("Loading Ruby (ruby.wasm)…");
  try {
    // arrayBuffer + compile (not compileStreaming): independent of the
    // Content-Type the host serves .wasm with.
    var response = await fetch("${t}/${w.rubyWasm}");
    if (!response.ok) throw new Error("failed to load ruby.wasm: " + response.status);
    var module = await WebAssembly.compile(await response.arrayBuffer());
    // consolePrint defaults to true: puts/warn land in console.*, which the
    // sandbox bootstrap relays to the panel.
    var booted = await window["ruby-wasm-wasi"].DefaultRubyVM(module);
    booted.vm.eval(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},P={id:`sql-sqljs`,label:`SQLite (sql.js)`,languages:[`sql`],layout:`console`,usesVendor:!0,replLanguage:`SQL`,tables:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.sqlJs}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${S(e)};
  function printResults(results) {
    if (!results.length) { console.log("OK (no rows returned)"); return; }
    results.forEach(function (res) {
      console.log(res.columns.join(" | "));
      res.values.forEach(function (row) { console.log(row.map(String).join(" | ")); });
    });
  }
  // Defined before the engine loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "SQL engine is still loading…"; };
  try {
    var SQL = await initSqlJs({ locateFile: function (f) { return "${t}/${w.sqlJsDir}" + f; } });
    var db = new SQL.Database();
    // db stays alive after the run: the REPL (and the table viewer) query it.
    window.__not3Eval__ = function (code) {
      printResults(db.exec(code));
      return undefined;
    };
    // --- table viewer -------------------------------------------------
    // Identifiers can never be bound as parameters in SQL, so every one is
    // first checked against the engine's own catalog and then double-quote
    // escaped. Search VALUES are always bound.
    function quoteIdent(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }
    function tableNames() {
      var res = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      return res.length ? res[0].values.map(function (r) { return String(r[0]); }) : [];
    }
    window.__not3Tables__ = function () {
      return tableNames().map(function (name) {
        var cols = db.exec("PRAGMA table_info(" + quoteIdent(name) + ")");
        var count = db.exec("SELECT COUNT(*) FROM " + quoteIdent(name));
        return {
          name: name,
          columns: cols.length ? cols[0].values.map(function (r) { return String(r[1]); }) : [],
          rowCount: count.length ? Number(count[0].values[0][0]) : 0,
        };
      });
    };
    window.__not3Rows__ = function (q) {
      if (tableNames().indexOf(q.table) === -1) throw new Error("unknown table: " + q.table);
      var info = window.__not3Tables__().filter(function (t) { return t.name === q.table; })[0];
      var where = "";
      var params = [];
      if (q.search) {
        where = " WHERE " + info.columns.map(function (c) {
          return "CAST(" + quoteIdent(c) + " AS TEXT) LIKE ?";
        }).join(" OR ");
        for (var i = 0; i < info.columns.length; i++) params.push("%" + q.search + "%");
      }
      var order = "";
      if (q.sortBy && info.columns.indexOf(q.sortBy) !== -1) {
        order = " ORDER BY " + quoteIdent(q.sortBy) + (q.sortDir === "desc" ? " DESC" : " ASC");
      }
      var limit = Math.max(1, Math.min(200, Number(q.limit) || 50));
      var offset = Math.max(0, Number(q.offset) || 0);
      var total = db.exec("SELECT COUNT(*) FROM " + quoteIdent(q.table) + where, params);
      var rows = db.exec(
        "SELECT * FROM " + quoteIdent(q.table) + where + order + " LIMIT " + limit + " OFFSET " + offset,
        params,
      );
      return {
        rows: rows.length ? rows[0].values.map(function (r) { return r.map(String); }) : [],
        total: total.length ? Number(total[0].values[0][0]) : 0,
      };
    };
    printResults(db.exec(CODE));
  } catch (e) { console.error(String(e)); }
})();
<\/script>`})},F={id:`sql-pglite`,label:`PostgreSQL (PGlite)`,languages:[`sql`],layout:`console`,usesVendor:!0,heavy:!0,replLanguage:`SQL`,tables:!0,build:({content:e,vendorBase:t})=>({body:`<script type="module">
const CODE = ${S(e)};
console.info("Loading PostgreSQL (PGlite)…");
function printResults(results) {
  for (const res of results) {
    if (!res.fields || !res.fields.length) {
      console.log("OK" + (res.affectedRows ? " (" + res.affectedRows + " rows)" : ""));
      continue;
    }
    console.log(res.fields.map((f) => f.name).join(" | "));
    for (const row of res.rows) {
      console.log(res.fields.map((f) => String(row[f.name])).join(" | "));
    }
  }
}
// Defined before the engine loads so REPL input during startup gets a clear
// answer instead of falling back to JS eval.
window.__not3Eval__ = function () { return "SQL engine is still loading…"; };
try {
  const { PGlite } = await import("${t}/${w.pglite}");
  const db = new PGlite();
  // db stays alive after the run: the REPL (and the table viewer) query it.
  window.__not3Eval__ = async function (code) {
    printResults(await db.exec(code));
    return undefined;
  };
  // --- table viewer ---------------------------------------------------
  // Identifiers can never be bound as parameters in SQL, so every one is
  // first checked against the catalog (information_schema) and then
  // double-quote escaped. Search VALUES are always bound.
  function quoteIdent(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }
  async function tableNames() {
    const res = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    return res.rows.map((r) => String(r.table_name));
  }
  async function columnsOf(table) {
    const res = await db.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
      [table],
    );
    return res.rows.map((r) => String(r.column_name));
  }
  window.__not3Tables__ = async function () {
    const names = await tableNames();
    const out = [];
    for (const name of names) {
      const columns = await columnsOf(name);
      const count = await db.query("SELECT COUNT(*) AS n FROM " + quoteIdent(name));
      out.push({ name: name, columns: columns, rowCount: Number(count.rows[0].n) });
    }
    return out;
  };
  window.__not3Rows__ = async function (q) {
    const names = await tableNames();
    if (names.indexOf(q.table) === -1) throw new Error("unknown table: " + q.table);
    const columns = await columnsOf(q.table);
    let where = "";
    const params = [];
    if (q.search) {
      const clauses = columns.map(function (c, i) {
        params.push("%" + q.search + "%");
        return quoteIdent(c) + "::text ILIKE $" + (i + 1);
      });
      where = " WHERE " + clauses.join(" OR ");
    }
    let order = "";
    if (q.sortBy && columns.indexOf(q.sortBy) !== -1) {
      order = " ORDER BY " + quoteIdent(q.sortBy) + (q.sortDir === "desc" ? " DESC" : " ASC");
    }
    const limit = Math.max(1, Math.min(200, Number(q.limit) || 50));
    const offset = Math.max(0, Number(q.offset) || 0);
    const total = await db.query(
      "SELECT COUNT(*) AS n FROM " + quoteIdent(q.table) + where,
      params,
    );
    const rows = await db.query(
      "SELECT * FROM " + quoteIdent(q.table) + where + order +
      " LIMIT " + limit + " OFFSET " + offset,
      params,
    );
    return {
      rows: rows.rows.map((row) => columns.map((c) => String(row[c]))),
      total: Number(total.rows[0].n),
    };
  };
  printResults(await db.exec(CODE));
} catch (e) { console.error(String(e && e.message || e)); }
<\/script>`})},I={id:`php-wasm`,label:`PHP (php-wasm)`,languages:[`php`],layout:`preview`,usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({body:`<div id="php-out"></div>
<script type="module">
// The Web Locks API rejects in opaque-origin contexts, and this iframe is
// deliberately opaque (that is the whole sandbox model). php-wasm's
// _enqueue() serializes every operation through navigator.locks.request, so
// without a shim the very first run dies as an unhandled rejection. One
// iframe == one tab == one queue, so a promise chain is a faithful
// replacement. defineProperty shadows the Navigator.prototype getter with an
// own property.
(function () {
  var chain = Promise.resolve();
  var locksShim = {
    request: function (name, optionsOrCallback, maybeCallback) {
      var callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
      var next = chain.then(function () {
        return callback({ name: String(name), mode: "exclusive" });
      });
      chain = next.catch(function () {});
      return next;
    },
    query: function () { return Promise.resolve({ held: [], pending: [] }); },
  };
  try {
    Object.defineProperty(navigator, "locks", { value: locksShim, configurable: true });
  } catch (e) { /* real locks stay; fine on non-opaque origins */ }
})();
const CODE = ${S(e)};
try {
  const { PhpWeb } = await import("${t}/${w.phpWeb}");
  const php = new PhpWeb();
  const out = document.getElementById("php-out");
  let stdout = "";
  php.addEventListener("output", function (e) { stdout += e.detail[0]; out.innerHTML = stdout; });
  php.addEventListener("error", function (e) { console.error(e.detail[0]); });
  const exitCode = await php.run(CODE);
  if (exitCode) console.warn("PHP exited with code: " + exitCode);
} catch (e) { console.error(String(e && e.message || e)); }
<\/script>`})},L={id:`cpp-jscpp`,label:`C++ (JSCPP interpreter)`,languages:[`cpp`],layout:`console`,usesVendor:!0,build:({content:e,vendorBase:t})=>{let n=e.replace(/\bstd::/g,``),r=n!==e;return{head:`<script src="${t}/${w.jscpp}"><\/script>`,body:`<script>
(function () {
  var CODE = ${S(n)};
  var STRIPPED = ${r};
  if (STRIPPED) console.info("note: std:: qualifiers were removed — the JSCPP interpreter has no namespace support");
  try {
    var buffered = "";
    var exit = JSCPP.run(CODE, "", { stdio: { write: function (s) {
      buffered += s;
      var lines = buffered.split("\\n");
      buffered = lines.pop();
      lines.forEach(function (l) { console.log(l); });
    } } });
    if (buffered) console.log(buffered);
    console.info("exit code: " + exit);
  } catch (e) { console.error(String(e && e.message || e)); }
})();
<\/script>`}}},R={id:`c-picoc`,label:`C (PicoC interpreter)`,languages:[`c`],layout:`console`,usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.picoc}"><\/script>`,body:`<script>
(function () {
  var CODE = ${S(e)};
  try {
    picocjs.runC(CODE, function (line) { console.log(line); });
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},z={id:`vue-sfc`,label:`Vue SFC`,languages:[`vue`],layout:`preview`,usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${w.vue}"><\/script><script src="${t}/${w.vueSfcLoader}"><\/script>`,body:`<div id="app"></div>
<script>
(function () {
  var CODE = ${S(e)};
  try {
    var options = {
      moduleCache: { vue: Vue },
      getFile: function () { return Promise.resolve(CODE); },
      addStyle: function (css) {
        var s = document.createElement("style");
        s.textContent = css;
        document.head.appendChild(s);
      },
      log: function (type) {
        (console[type] || console.log).apply(console, [].slice.call(arguments, 1));
      },
    };
    var loadModule = window["vue3-sfc-loader"].loadModule;
    var app = Vue.createApp(
      Vue.defineAsyncComponent(function () { return loadModule("note.vue", options); }),
    );
    // The dev build warns via console.warn on its own, but explicit handlers
    // also catch render/handler exceptions (e.g. a @click bound to a missing
    // method) and give them a stable, greppable prefix.
    app.config.warnHandler = function (msg, _instance, trace) {
      console.warn("[Vue warn] " + msg + (trace ? "\\n" + trace : ""));
    };
    app.config.errorHandler = function (err) {
      console.error(String(err && err.stack || err));
    };
    app.mount("#app");
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},B={id:`svelte`,label:`Svelte`,languages:[`svelte`],layout:`preview`,usesVendor:!0,scriptBlob:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script type="importmap">${S({imports:{svelte:`${t}/${w.svelteIndexClient}`,"svelte/internal/client":`${t}/${w.svelteInternalClient}`,"svelte/internal/disclose-version":`${t}/${w.svelteDiscloseVersion}`,"svelte/internal/flags/legacy":`${t}/${w.svelteFlagsLegacy}`,"#client/constants":`${t}/${w.svelteClientConstants}`,"esm-env":`${t}/${w.svelteEsmEnv}`,"esm-env/browser":`${t}/${w.svelteEsmEnvBrowser}`,"esm-env/development":`${t}/${w.svelteEsmEnvDevelopment}`,"esm-env/node":`${t}/${w.svelteEsmEnvNode}`,clsx:`${t}/${w.svelteClsx}`}})}<\/script><script src="${t}/${w.svelteCompiler}"><\/script>`,body:`<div id="app"></div>
<script type="module">
const CODE = ${S(e)};
console.info("Compiling Svelte…");
try {
  const compiled = svelte.compile(CODE, { generate: "client" });
  const blob = new Blob([compiled.js.code], { type: "text/javascript" });
  const mod = await import(URL.createObjectURL(blob));
  const { mount } = await import("svelte");
  mount(mod.default, { target: document.getElementById("app") });
  if (compiled.css && compiled.css.code) {
    const style = document.createElement("style");
    style.textContent = compiled.css.code;
    document.head.appendChild(style);
  }
} catch (e) { console.error(String(e && e.stack || e)); }
<\/script>`})};function V(e,t,n,r){let i=[],a=e=>e==null?``:typeof e==`object`?JSON.stringify(e):String(e),o=e=>{let t=e,n=2;for(;i.some(e=>e.name===t);)t=`${e} (${n++})`;return t};if(t===`json`){let t;try{t=JSON.parse(e)}catch(e){return{tables:i,error:`Invalid JSON: ${String(e)}`}}let n=(e,t)=>{if(!t.length||!t.every(e=>typeof e==`object`&&!!e&&!Array.isArray(e)))return;let n=t,r=[...new Set(n.flatMap(e=>Object.keys(e)))];r.length&&i.push({name:o(e),columns:r,rows:n.map(e=>r.map(t=>a(e[t])))})};if(Array.isArray(t))n(`data`,t);else if(typeof t==`object`&&t)for(let[e,r]of Object.entries(t))Array.isArray(r)&&n(e,r)}else if(t===`csv`){if(!r)return{tables:i,error:`CSV parser failed to load`};let t=r.parse(e,{delimiter:``,delimitersToGuess:[`,`,`	`,`;`],dynamicTyping:!1,skipEmptyLines:`greedy`});if(t.errors.length)return{tables:i,error:`CSV parse error: ${t.errors[0].message}`};let n=t.data;if(n.length>=2&&n[0].length>=2){let e=n[0];if(n.slice(1).some(t=>t.length!==e.length))return{tables:i,error:`CSV parse error: inconsistent row width`};i.push({name:`data`,columns:e,rows:n.slice(1)})}}else if(t===`markdown`&&n){let t=new n().parse(e,{}),r=null,a=0,s=null,c=[],l=!1,u=!1;for(let e of t)if(e.type===`heading_open`)l=!0;else if(e.type===`heading_close`)l=!1;else if(e.type===`table_open`)s={name:o(r??`Table ${++a}`),columns:[],rows:[]};else if(e.type===`tr_open`&&s)c=[];else if((e.type===`th_open`||e.type===`td_open`)&&s)u=!0;else if((e.type===`th_close`||e.type===`td_close`)&&s)u=!1;else if(e.type===`inline`){let t=e.children?.filter(e=>e.type===`text`||e.type===`code_inline`).map(e=>e.content).join(``)??e.content;l?r=t||null:s&&u&&c.push(t)}else e.type===`tr_close`&&s?s.columns.length?s.rows.push(c):s.columns=c:e.type===`table_close`&&s&&(i.push(s),s=null)}return i.length?{tables:i}:{tables:i,message:`No tabular data found`}}function H(e,t){let n=e.find(e=>e.name===t.table);if(!n)throw Error(`unknown table: ${t.table}`);let r=String(t.search??``).toLocaleLowerCase(),i=r?n.rows.filter(e=>e.some(e=>e.toLocaleLowerCase().includes(r))):n.rows,a=n.columns.indexOf(t.sortBy??``),o=a<0?i:i.map((e,t)=>({row:e,index:t})).sort((e,n)=>{let r=(e.row[a]??``).localeCompare(n.row[a]??``,void 0,{numeric:!0,sensitivity:`base`});return(t.sortDir===`desc`?-r:r)||e.index-n.index}).map(({row:e})=>e),s=Math.max(0,Math.floor(Number(t.offset)||0)),c=Math.min(50,Math.max(1,Math.floor(Number(t.limit)||50)));return{rows:o.slice(s,s+c),total:o.length}}var ue=[le,C,T,E,D,k,A,j,M,N,P,F,I,L,R,z,B,{id:`data-tables`,label:`Data tables`,languages:[`csv`,`json`,`markdown`],layout:`console`,tables:!0,defaultTab:`tables`,noRepl:!0,usesVendor:!0,build:({content:e,vendorBase:t,languageId:n})=>({head:`<script src="${t}/${w.markdown}"><\/script><script src="${t}/${w.papaParse}"><\/script>`,body:`<script>
(function () {
  var source = ${S(e)};
  var language = ${S(n??`csv`)};
  var parse = (${V.toString()});
  var query = (${H.toString()});
  var result = parse(source, language, window.__not3Markdown && window.__not3Markdown.MarkdownIt, window.Papa);
  var tables = result.tables;
  window.__not3Tables__ = function () {
    return tables.map(function (table) {
      return { name: table.name, columns: table.columns, rowCount: table.rows.length };
    });
  };
  window.__not3Rows__ = function (request) { return query(tables, request); };
  if (result.error) console.error(result.error);
  else if (result.message) console.info(result.message);
  else tables.forEach(function (table) { console.info("Parsed " + table.rows.length + " rows × " + table.columns.length + " columns"); });
})();
<\/script>`})}];function de(e){return e?ue.filter(t=>t.languages.includes(e)):[]}function U(e){return de(e).length>0}var W=globalThis.setInterval,G={class:`flex-grow basis-0 overflow-auto flex flex-col text-xs font-mono min-h-0`},K={key:0,class:`flex-grow flex items-center justify-center text-white/50 px-4 text-center`},q={class:`flex items-center gap-2 px-2 py-1 border-b border-black flex-wrap`},fe=[`value`],pe=[`value`],me=[`value`],he={class:`overflow-auto flex-grow min-h-0`},ge={class:`border-collapse w-full`},_e={class:`sticky top-0 bg-[#111]`},ve=[`onClick`],J={key:0},Y={key:0},X=[`colspan`],ye={class:`flex items-center gap-2 px-2 py-1 border-t border-black`},Z=[`disabled`],be=[`disabled`],xe={key:0,class:`text-white/50`},Se=Object.assign(u({__name:`sandbox-tables`,props:{tables:{},selected:{},columns:{},rows:{},total:{},offset:{},limit:{},sortBy:{},sortDir:{},search:{},loading:{type:Boolean}},emits:[`select`,`search`,`sort`,`page`,`refresh`],setup(e){return(t,n)=>(o(),m(`div`,G,[e.tables.length?(o(),m(h,{key:1},[_(`div`,q,[_(`select`,{value:e.selected,class:`bg-black border border-white/40 rounded-sm py-0.5`,onChange:n[0]||=e=>t.$emit(`select`,e.target.value)},[(o(!0),m(h,null,i(e.tables,e=>(o(),m(`option`,{key:e.name,value:e.name},f(e.name)+` (`+f(e.rowCount)+`) `,9,pe))),128))],40,fe),_(`input`,{value:e.search,placeholder:`Search…`,class:`bg-transparent border border-white/40 rounded-sm px-1 py-0.5 outline-none`,onInput:n[1]||=e=>t.$emit(`search`,e.target.value)},null,40,me),_(`button`,{class:`border border-white/40 px-2 rounded-sm hover:bg-white/10`,onClick:n[2]||=e=>t.$emit(`refresh`)},` Refresh `)]),_(`div`,he,[_(`table`,ge,[_(`thead`,_e,[_(`tr`,null,[(o(!0),m(h,null,i(e.columns,n=>(o(),m(`th`,{key:n,class:`text-left px-2 py-1 border-b border-white/20 cursor-pointer select-none whitespace-nowrap`,onClick:e=>t.$emit(`sort`,n)},[v(f(n)+` `,1),e.sortBy===n?(o(),m(`span`,J,f(e.sortDir===`asc`?`▲`:`▼`),1)):p(``,!0)],8,ve))),128))])]),_(`tbody`,null,[(o(!0),m(h,null,i(e.rows,(e,t)=>(o(),m(`tr`,{key:t,class:`odd:bg-white/5`},[(o(!0),m(h,null,i(e,(e,t)=>(o(),m(`td`,{key:t,class:`px-2 py-0.5 whitespace-nowrap max-w-64 overflow-hidden text-ellipsis`},f(e),1))),128))]))),128)),e.rows.length?p(``,!0):(o(),m(`tr`,Y,[_(`td`,{colspan:e.columns.length,class:`px-2 py-2 text-white/50`},`No rows.`,8,X)]))])])]),_(`div`,ye,[_(`button`,{class:`border border-white/40 px-2 rounded-sm disabled:opacity-40`,disabled:e.offset===0,onClick:n[3]||=e=>t.$emit(`page`,-1)},`‹`,8,Z),_(`span`,null,f(e.total?e.offset+1:0)+`–`+f(Math.min(e.offset+e.rows.length,e.total))+` of `+f(e.total),1),_(`button`,{class:`border border-white/40 px-2 rounded-sm disabled:opacity-40`,disabled:e.offset+e.limit>=e.total,onClick:n[4]||=e=>t.$emit(`page`,1)},`›`,8,be),e.loading?(o(),m(`span`,xe,`loading…`)):p(``,!0)])],64)):(o(),m(`div`,K,` No tables found. Run a note that creates a table or contains tabular data. `))]))}}),{__name:`EditorSandboxTables`}),Ce=`useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict`,we=(e=21)=>{let t=``,n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=Ce[n[e]&63];return t},Te=65536,Ee=10;function De(e){let t=e.flags;return t.includes(`g`)||(t+=`g`),t.includes(`m`)||(t+=`m`),new RegExp(e.source,t)}function Oe(e){let t=e.slice(0,Te).trimStart();if(t.startsWith(`{`)||t.startsWith(`<`)||t.startsWith(`[`))return!1;let n=t.split(/\r?\n/);for(let e of[`,`,`;`,`	`]){let t=t=>{let n=[],r=``,i=!1;for(let a=0;a<t.length;a++){let o=t[a];o===`"`?i&&t[a+1]===`"`?(r+=`"`,a++):i=!i:o===e&&!i?(n.push(r.trim()),r=``):r+=o}return n.push(r.trim()),i?null:n};for(let e=0;e<=n.length-3;e++){let r=n.slice(e,e+3);if(r.some(e=>/^\s*[<{]/.test(e)))continue;let i=r.map(t);if(i.some(e=>e===null))continue;let[a,o,s]=i;if(!(a.length<3||a.length!==o.length||a.length!==s.length)&&!a.some(e=>!e||e.split(/\s+/).length>2)&&![a,o,s].some(e=>e.some(e=>/[.!?]$/.test(e))))return!0}}return!1}function ke(e){if(!e.trim())return`plaintext`;if(Oe(e))return`csv`;let t=e.slice(0,Te),n=oe.filter(e=>e.detectionPatterns&&e.detectionPatterns.length>0).map(e=>{let n=e.detectionPatterns.reduce((e,{pattern:n,weight:r=1})=>{let i=t.match(De(n))?.length??0;return e+Math.min(i,Ee)*r},0);return{languageId:e.id,score:n}});return n.sort((e,t)=>t.score-e.score),n.length>0&&n[0].score>0?n[0].languageId:`plaintext`}function Q(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e(...r),t)}}var Ae=`not3/sandbox/console`,je=`not3/sandbox/ready`,Me=`not3/sandbox/eval`,Ne=`not3/sandbox/tables/request`,Pe=`not3/sandbox/tables/result`,Fe=`not3/sandbox/rows/request`,Ie=`not3/sandbox/rows/result`,Le=[`log`,`info`,`warn`,`error`,`debug`,`clear`],Re=1e3,ze=200,Be=1e4,Ve=500,He=200,Ue=200,We=new Set(`background.background-attachment.background-clip.background-color.background-image.background-origin.background-position.background-repeat.background-size.border.border-bottom.border-color.border-left.border-radius.border-right.border-style.border-top.border-width.box-decoration-break.box-shadow.color.cursor.display.font.font-family.font-size.font-stretch.font-style.font-variant.font-weight.letter-spacing.line-height.margin.margin-bottom.margin-left.margin-right.margin-top.opacity.outline.outline-color.outline-style.outline-width.padding.padding-bottom.padding-left.padding-right.padding-top.text-decoration.text-decoration-color.text-decoration-line.text-decoration-style.text-shadow.text-transform.vertical-align.white-space.word-break.word-spacing.word-wrap`.split(`.`)),Ge=/url\(|image-set\(|@import|expression\(|javascript:|[\\<>{}]/i;function Ke(e){if(!e||e.length>Re)return``;let t=[];for(let n of e.split(`;`)){let e=n.indexOf(`:`);if(e===-1)continue;let r=n.slice(0,e).trim().toLowerCase(),i=n.slice(e+1).trim();i&&We.has(r)&&(Ge.test(i)||t.push(`${r}: ${i}`))}return t.join(`; `)}function qe(e){if(Array.isArray(e)&&e.length!==0)return e.slice(0,ze).map(e=>{let t=typeof e==`object`&&e?e:{},n=`text`in t?t.text:e;return{text:typeof n==`string`?n:String(n),css:typeof t.css==`string`?Ke(t.css):``}})}function Je(e){let t=typeof e==`string`?e:String(e);return t.length>Be?t.slice(0,Be)+`…`:t}function Ye(e){let t=Number(e);return Number.isFinite(t)?t:null}function Xe(e){return Array.isArray(e)?e.slice(0,Ve).map(e=>{let t=typeof e==`object`&&e?e:{},n=Array.isArray(t.columns)?t.columns.slice(0,He).map(Je):[];return{name:Je(t.name),columns:n,rowCount:Ye(t.rowCount)??0}}):null}function Ze(e){return Array.isArray(e)?e.slice(0,Ue).map(e=>Array.isArray(e)?e.slice(0,He).map(Je):[]):null}function Qe(e,t){if(typeof e!=`object`||!e)return null;let n=e;if(n.token!==t)return null;if(n.type===`not3/sandbox/ready`)return{type:je};if(n.type===`not3/sandbox/tables/result`){let e=Xe(n.tables);return e?{type:Pe,tables:e}:null}if(n.type===`not3/sandbox/rows/result`){let e=Ye(n.id),t=Ye(n.total),r=Ze(n.rows);return e===null||t===null||!r?null:{type:Ie,id:e,total:t,rows:r}}if(n.type!==`not3/sandbox/console`||!Le.includes(n.level)||!Array.isArray(n.args))return null;let r=qe(n.segments);return{type:Ae,level:n.level,args:n.args.map(e=>typeof e==`string`?e:String(e)),...r?{segments:r}:{}}}function $e(e){return`
(function () {
  var TOKEN = ${JSON.stringify(e)};
  var CONSOLE_MSG = ${JSON.stringify(Ae)};
  var EVAL_MSG = ${JSON.stringify(Me)};
  var READY_MSG = ${JSON.stringify(je)};
  var TABLES_REQ = ${JSON.stringify(Ne)};
  var TABLES_RES = ${JSON.stringify(Pe)};
  var ROWS_REQ = ${JSON.stringify(Fe)};
  var ROWS_RES = ${JSON.stringify(Ie)};
  var MAX_ARG_LENGTH = 10000;

  function post(level, args, segments) {
    try {
      window.parent.postMessage({
        type: CONSOLE_MSG,
        token: TOKEN,
        level: level,
        args: args,
        segments: segments,
      }, "*");
    } catch (e) { /* ignored */ }
  }

  function serialize(value, depth, seen) {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    var t = typeof value;
    if (t === "string") return depth === 0 ? value : JSON.stringify(value);
    if (t === "number" || t === "boolean") return String(value);
    if (t === "bigint") return String(value) + "n";
    if (t === "symbol") return value.toString();
    if (t === "function") return "[Function: " + (value.name || "anonymous") + "]";
    if (value instanceof Error) return value.stack || value.name + ": " + value.message;
    if (depth >= 3) return Object.prototype.toString.call(value);
    if (seen.indexOf(value) !== -1) return "[Circular]";
    seen.push(value);
    if (Array.isArray(value)) {
      var items = value.slice(0, 100).map(function (v) { return serialize(v, depth + 1, seen); });
      if (value.length > 100) items.push("… " + (value.length - 100) + " more");
      return "[" + items.join(", ") + "]";
    }
    if (typeof Node !== "undefined" && value instanceof Node) {
      return "<" + String(value.nodeName || "node").toLowerCase() + ">";
    }
    var keys;
    try { keys = Object.keys(value); } catch (e) { return Object.prototype.toString.call(value); }
    var parts = keys.slice(0, 50).map(function (k) {
      var v;
      try { v = value[k]; } catch (e) { v = "[Getter]"; }
      return k + ": " + serialize(v, depth + 1, seen);
    });
    if (keys.length > 50) parts.push("… " + (keys.length - 50) + " more");
    return "{" + parts.join(", ") + "}";
  }

  function toStrings(args) {
    return Array.prototype.map.call(args, function (a) {
      var s;
      try { s = serialize(a, 0, []); } catch (e) { s = String(a); }
      return clamp(s);
    });
  }

  function clamp(s) {
    return s.length > MAX_ARG_LENGTH ? s.slice(0, MAX_ARG_LENGTH) + "…" : s;
  }

  function toInt(value) {
    var n = Number(value);
    if (isNaN(n)) return "NaN";
    return String(n < 0 ? Math.ceil(n) : Math.floor(n));
  }

  /**
   * Apply console format directives of the first argument the way browsers do:
   * %c switches the style of everything that follows, %s/%d/%i/%f/%o/%O
   * substitute the next argument, %% is a literal percent sign. Returns null
   * when no directive consumed an argument, so plain calls keep the fast path.
   */
  function format(list) {
    var fmt = list[0];
    var next = 1;
    var css = "";
    var buffer = "";
    var segments = [];
    var styled = false;
    var consumed = false;
    var i = 0;
    while (i < fmt.length) {
      var directive = fmt.charAt(i) === "%" ? fmt.charAt(i + 1) : "";
      if (directive === "%") { buffer += "%"; i += 2; continue; }
      if (directive === "" || "csdifoO".indexOf(directive) === -1 || next >= list.length) {
        buffer += fmt.charAt(i);
        i += 1;
        continue;
      }
      var value = list[next++];
      consumed = true;
      if (directive === "c") {
        segments.push({ text: clamp(buffer), css: css });
        buffer = "";
        css = typeof value === "string" ? value.slice(0, 1000) : "";
        styled = true;
      } else if (directive === "s") buffer += serialize(value, 0, []);
      else if (directive === "d" || directive === "i") buffer += toInt(value);
      else if (directive === "f") {
        var f = Number(value);
        buffer += isNaN(f) ? "NaN" : String(f);
      } else buffer += serialize(value, 1, []);
      i += 2;
    }
    if (!consumed) return null;
    segments.push({ text: clamp(buffer), css: css });
    for (; next < list.length; next++) {
      segments.push({ text: clamp(" " + serialize(list[next], 0, [])), css: "" });
    }
    var text = "";
    for (var s = 0; s < segments.length; s++) text += segments[s].text;
    return { segments: segments, styled: styled, text: clamp(text) };
  }

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    var original = console[level] ? console[level].bind(console) : null;
    console[level] = function () {
      var list = Array.prototype.slice.call(arguments);
      var formatted = null;
      if (typeof list[0] === "string" && list[0].indexOf("%") !== -1) {
        try { formatted = format(list); } catch (e) { formatted = null; }
      }
      if (formatted && formatted.styled) post(level, [formatted.text], formatted.segments);
      else if (formatted) post(level, [formatted.text]);
      else post(level, toStrings(arguments));
      if (original) original.apply(null, arguments);
    };
  });

  var originalClear = console.clear ? console.clear.bind(console) : null;
  console.clear = function () {
    post("clear", []);
    if (originalClear) originalClear();
  };

  window.addEventListener("error", function (event) {
    post("error", [
      (event.message || "Script error") +
      " (" + (event.filename || "sandbox") + ":" + (event.lineno || 0) + ")",
    ]);
  });

  window.addEventListener("unhandledrejection", function (event) {
    var s;
    try { s = serialize(event.reason, 0, []); } catch (e) { s = String(event.reason); }
    post("error", ["Unhandled promise rejection: " + s]);
  });

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    var data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.token !== TOKEN) return;
    // Table viewer: answered from the runner's live database, never from a
    // bulk copy held in the parent.
    if (data.type === TABLES_REQ) {
      var tf = window.__not3Tables__;
      if (typeof tf !== "function") return;
      Promise.resolve().then(function () { return tf(); }).then(function (tables) {
        window.parent.postMessage({ type: TABLES_RES, token: TOKEN, tables: tables }, "*");
      }).catch(function (e) { post("error", [serialize(e, 0, [])]); });
      return;
    }
    if (data.type === ROWS_REQ) {
      var rf = window.__not3Rows__;
      if (typeof rf !== "function" || !data.query || typeof data.query !== "object") return;
      Promise.resolve().then(function () { return rf(data.query); }).then(function (res) {
        window.parent.postMessage({
          type: ROWS_RES,
          token: TOKEN,
          id: data.query.id,
          rows: res.rows,
          total: res.total,
        }, "*");
      }).catch(function (e) { post("error", [serialize(e, 0, [])]); });
      return;
    }
    if (data.type !== EVAL_MSG) return;
    var hook = window.__not3Eval__;
    if (typeof hook === "function") {
      // Runner-provided REPL (sql, python, ...). Treated as async by
      // contract, so a hook may await its interpreter. A non-empty
      // resolution is logged; the hook may also print via console itself
      // and resolve undefined.
      Promise.resolve().then(function () { return hook(String(data.code)); })
        .then(function (result) {
          if (result !== undefined && result !== null) post("log", [clamp(String(result))]);
        })
        .catch(function (e) { post("error", [serialize(e, 0, [])]); });
      return;
    }
    try {
      var result = (0, eval)(String(data.code));
      post("log", [serialize(result, 0, [])]);
    } catch (e) {
      post("error", [serialize(e, 0, [])]);
    }
  });

  window.parent.postMessage({ type: READY_MSG, token: TOKEN }, "*");
})();
`}var et=`allow-scripts allow-modals`;function tt(e){let t=e.allowNetwork?` https:`:``,n=e.vendorOrigin?` ${e.vendorOrigin}`:``,r=e.scriptBlob?` blob:`:``,i=[...e.vendorOrigin?[e.vendorOrigin]:[],...e.allowNetwork?[`https:`,`wss:`]:[]],a=[`default-src 'none'`,`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${r}${n}${t}`,`style-src 'unsafe-inline'${n}${t}`,`img-src data: blob:${n}${t}`,`font-src data:${n}${t}`,`media-src data: blob:${n}${t}`];return(e.vendorOrigin||e.scriptBlob)&&a.push(`worker-src blob:${n}`),a.push(`connect-src ${i.length?i.join(` `):`'none'`}`,`form-action 'none'`,`base-uri 'none'`),a.join(`; `)}function nt(e,t){let n=(t||`/`).replace(/^\/*/,`/`).replace(/\/*$/,`/`);return`${e.replace(/\/$/,``)}${n}vendor`}function rt(e){let t=e.runner.build({content:e.content,languageId:e.languageId,vendorBase:nt(e.origin,e.basePath),theme:e.theme}),n=`<meta http-equiv="Content-Security-Policy" content="${tt({allowNetwork:e.allowNetwork,vendorOrigin:e.runner.usesVendor?e.origin:null,scriptBlob:e.runner.scriptBlob===!0})}"><script>${$e(e.token)}<\/script>`+(t.head??``);if(t.bare)return`<!doctype html>`+n+t.body;let r=e.runner.layout===`preview`?`<style>body{background:#fff}</style>`:`<style>body{background:#1e1e1e}</style>`;return`<!doctype html><html><head>`+n+r+`</head><body>`+t.body+`</body></html>`}function it(e,t,n,r){return t&&e.set(t,n),e.get(r.id)??!r.heavy}function at(e){return e.tables&&e.defaultTab===`tables`?`tables`:`console`}var ot=100;function st(){let e=new Map,t=t=>{let n=e.get(t);return n||(n={commands:[],cursor:null,draft:``},e.set(t,n)),n};return{record(e,n){if(!n)return;let r=t(e);r.commands.push(n),r.commands.length>ot&&r.commands.shift(),r.cursor=null,r.draft=``},navigate(e,n,r){let i=t(e);return i.commands.length?n===`up`?(i.cursor===null?(i.draft=r,i.cursor=i.commands.length-1):i.cursor=Math.max(0,i.cursor-1),i.commands[i.cursor]):i.cursor===null?r:i.cursor===i.commands.length-1?(i.cursor=null,i.draft):i.commands[++i.cursor]:r},switchRunner(e,n,r){if(e){let n=t(e);n.cursor===null&&(n.draft=r),n.cursor=null}return t(n).draft}}}var ct={class:`w-full h-full flex flex-col bg-[#111] text-white min-w-0 min-h-0`},lt={class:`flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap`},ut={class:`font-bold select-none`},dt=[`value`],ft={class:`flex items-center gap-1 select-none cursor-pointer`,title:`Re-run automatically when the note changes`},pt={class:`flex items-center gap-1 select-none cursor-pointer`,title:`Allow the sandbox to load resources from and connect to https:// hosts. Off by default so note code cannot send data anywhere.`},mt=[`srcdoc`,`sandbox`],ht={key:0,class:`flex items-center gap-1 px-2 py-1 bg-black/60 text-xs`},gt=[`onClick`],_t=[`placeholder`],vt=500,yt=50,bt=700,xt=15,St=Object.assign(u({__name:`sandbox-panel`,props:{content:{},languageId:{},popout:{type:Boolean},resizing:{type:Boolean}},emits:[`close`,`popout`,`engine`],setup(u,{emit:oe}){let S=u,se=oe,ce={log:`text-gray-100`,info:`text-blue-300`,warn:`text-yellow-400`,error:`text-red-400`,debug:`text-gray-500`,input:`text-green-400`},{uiBaseURL:le}=a().public,C=t(),w=t(),T=t([]),E=t(``),D=st(),O=t(!0),k=t(!1),A=t(``),j=``,M=new Map,N=t(``);x(N,e=>se(`engine`,e));let P=d(()=>de(S.languageId)),F=d(()=>P.value.find(e=>e.id===N.value)??P.value[0]??null),I=t(`console`),L=t([]),R=t(``),z=t({rows:[],total:0,offset:0,sortBy:null,sortDir:`asc`,search:``,loading:!1}),B=0,V=null,H=0,ue=d(()=>L.value.find(e=>e.name===R.value)?.columns??[]);function U(e){C.value?.contentWindow?.postMessage({...e,token:j},`*`)}function W(){V&&clearTimeout(V),V=null}function G(){if(!F.value?.tables)return;W(),H=0;let e=()=>{U({type:Ne}),++H<xt&&(V=setTimeout(e,bt))};e()}function K(){R.value&&(z.value.loading=!0,U({type:Fe,query:{id:++B,table:R.value,offset:z.value.offset,limit:yt,sortBy:z.value.sortBy??void 0,sortDir:z.value.sortDir,search:z.value.search||void 0}}))}function q(){W(),L.value=[],R.value=``,z.value={rows:[],total:0,offset:0,sortBy:null,sortDir:`asc`,search:``,loading:!1}}function fe(e){I.value=e,e===`tables`&&G()}function pe(e){R.value=e,z.value.offset=0,z.value.sortBy=null,z.value.sortDir=`asc`,z.value.search=``,K()}let me=Q(K,300);function he(e){z.value.search=e,z.value.offset=0,me()}function ge(e){z.value.sortBy===e?z.value.sortDir=z.value.sortDir===`asc`?`desc`:`asc`:(z.value.sortBy=e,z.value.sortDir=`asc`),K()}function _e(e){z.value.offset=Math.max(0,z.value.offset+e*yt),K()}function ve(e){return e.segments??[{text:e.text,css:``}]}function J(e){T.value.push(e),T.value.length>vt&&T.value.splice(0,T.value.length-vt),ae(()=>w.value?.scrollTo({top:w.value.scrollHeight}))}function Y(){F.value&&(I.value=at(F.value),T.value=[],q(),j=we(),A.value=rt({runner:F.value,content:S.content,languageId:S.languageId,token:j,allowNetwork:k.value,origin:window.location.origin,basePath:le,theme:`dark`}),F.value.tables&&G())}function X(e){if(!C.value||e.source!==C.value.contentWindow)return;let t=Qe(e.data,j);if(t){if(t.type===`not3/sandbox/tables/result`){W(),L.value=t.tables,L.value.some(e=>e.name===R.value)||(R.value=L.value[0]?.name??``,z.value.offset=0),R.value&&K();return}if(t.type===`not3/sandbox/rows/result`){if(t.id!==B)return;z.value.rows=t.rows,z.value.total=t.total,z.value.loading=!1;return}t.type===`not3/sandbox/console`&&(t.level===`clear`?T.value=[]:J({level:t.level,text:t.args.join(` `),segments:t.segments}))}}function ye(){let e=E.value.trim();e&&C.value?.contentWindow&&(F.value&&D.record(F.value.id,e),J({level:`input`,text:`> `+e}),I.value=`console`,U({type:Me,code:e}),E.value=``)}function Z(e){F.value&&(E.value=D.navigate(F.value.id,e,E.value))}let be=Q(()=>{O.value&&Y()},1e3);return x(()=>S.content,()=>be()),x(k,Y),x(P,e=>{e.some(e=>e.id===N.value)||(N.value=e[0]?.id??``)}),x([F,()=>S.languageId],([e,t],[n,r])=>{if(!e){se(`close`);return}let i=e.id!==n?.id;(i||t!==r)&&(i&&(E.value=D.switchRunner(n?.id??``,e.id,E.value),O.value=it(M,n?.id??null,O.value,e)),I.value=at(e),O.value?Y():(j=we(),T.value=[],q(),A.value=``))}),n(()=>{window.addEventListener(`message`,X),N.value=P.value[0]?.id??``,O.value=!F.value||it(M,null,O.value,F.value),Y()}),r(()=>{window.removeEventListener(`message`,X),W()}),(t,n)=>{let r=Se;return o(),m(`div`,ct,[_(`div`,lt,[_(`span`,ut,f(y(F)?.label||`Sandbox`),1),y(P).length>1?s((o(),m(`select`,{key:0,"onUpdate:modelValue":n[0]||=e=>c(N)?N.value=e:null,class:`panel-select`,title:`Execution engine for this language`},[(o(!0),m(h,null,i(y(P),e=>(o(),m(`option`,{key:e.id,value:e.id},f(e.label),9,dt))),128))],512)),[[e,y(N)]]):p(``,!0),_(`button`,{class:`panel-btn`,onClick:Y},`Run`),_(`button`,{class:`panel-btn`,onClick:n[1]||=e=>T.value=[]},`Clear`),_(`label`,ft,[s(_(`input`,{"onUpdate:modelValue":n[2]||=e=>c(O)?O.value=e:null,type:`checkbox`},null,512),[[l,y(O)]]),n[9]||=v(` auto `,-1)]),_(`label`,pt,[s(_(`input`,{"onUpdate:modelValue":n[3]||=e=>c(k)?k.value=e:null,type:`checkbox`},null,512),[[l,y(k)]]),n[10]||=v(` network `,-1)]),n[11]||=_(`div`,{class:`flex-grow`},null,-1),u.popout?p(``,!0):(o(),m(`button`,{key:1,class:`panel-btn`,title:`Move this panel into a separate window`,onClick:n[4]||=e=>t.$emit(`popout`)},`Popout`)),_(`button`,{class:g(u.popout?`panel-btn`:`panel-btn sm:hidden`),onClick:n[5]||=e=>t.$emit(`close`)},`Close`,2)]),_(`iframe`,{ref_key:`iframe`,ref:C,srcdoc:y(A),sandbox:y(et),referrerpolicy:`no-referrer`,class:g([y(F)?.layout===`preview`?`w-full flex-grow bg-white border-none`:`hidden`,u.resizing?`pointer-events-none`:``])},null,10,mt),y(F)?.tables?(o(),m(`div`,ht,[(o(),m(h,null,i([`console`,`tables`],e=>_(`button`,{key:e,class:g([`px-2 rounded-sm border border-white/40 capitalize`,y(I)===e?`bg-white/20`:`hover:bg-white/10`]),onClick:t=>fe(e)},f(e),11,gt)),64))])):p(``,!0),y(F)?.tables?s((o(),ie(r,{key:1,tables:y(L),selected:y(R),columns:y(ue),rows:y(z).rows,total:y(z).total,offset:y(z).offset,limit:yt,"sort-by":y(z).sortBy,"sort-dir":y(z).sortDir,search:y(z).search,loading:y(z).loading,onSelect:pe,onSearch:he,onSort:ge,onPage:_e,onRefresh:G},null,8,[`tables`,`selected`,`columns`,`rows`,`total`,`offset`,`sort-by`,`sort-dir`,`search`,`loading`])),[[ne,y(I)===`tables`]]):p(``,!0),s(_(`div`,{ref_key:`output`,ref:w,class:g([`overflow-y-auto font-mono text-xs px-2 py-1`,y(F)?.layout===`preview`?`h-48 border-t border-black flex-shrink-0`:`flex-grow basis-0`])},[(o(!0),m(h,null,i(y(T),(e,t)=>(o(),m(`div`,{key:t,class:g([`whitespace-pre-wrap break-all`,ce[e.level]])},[(o(!0),m(h,null,i(ve(e),(e,t)=>(o(),m(`span`,{key:t,style:re(e.css)},f(e.text),5))),128))],2))),128))],2),[[ne,y(I)===`console`]]),y(F)?.noRepl?p(``,!0):(o(),m(`form`,{key:2,class:`flex items-center border-t border-black`,onSubmit:b(ye,[`prevent`])},[n[12]||=_(`span`,{class:`pl-2 pr-1 py-1 text-green-400 font-mono text-xs select-none`},`>`,-1),s(_(`input`,{"onUpdate:modelValue":n[6]||=e=>c(E)?E.value=e:null,class:`flex-grow bg-transparent font-mono text-xs py-1 pr-2 outline-none`,placeholder:`Run ${y(F)?.replLanguage??`JavaScript`} in the sandbox…`,onKeydown:[n[7]||=te(b(e=>Z(`up`),[`prevent`]),[`up`]),n[8]||=te(b(e=>Z(`down`),[`prevent`]),[`down`])]},null,40,_t),[[ee,y(E)]])],32))])}}}),{__name:`EditorSandboxPanel`}),Ct=`not3/popout/ready`,wt=`not3/popout/state`,Tt=`not3/popout/engine`;function Et(e){if(typeof e!=`object`||!e)return null;let t=e;return t.type===`not3/popout/ready`?{type:Ct}:t.type===`not3/popout/engine`?t.engineId!==`sql-sqljs`&&t.engineId!==`sql-pglite`?null:{type:Tt,engineId:t.engineId}:t.type!==`not3/popout/state`||typeof t.content!=`string`||typeof t.languageId!=`string`?null:{type:wt,content:t.content,languageId:t.languageId}}var $=null;function Dt(e){$=e}function Ot(){return $}function kt(){try{$?.close()}catch{}$=null}export{Ot as a,St as c,Oe as d,W as f,kt as i,Q as l,Ct as n,Et as o,U as p,wt as r,Dt as s,Tt as t,ke as u};