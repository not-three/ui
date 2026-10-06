import{d as _e,o as b,e as w,F as L,g as v,q as T,j as A,t as C,h as ne,M as Ge,V as F,l as We,m as Je,a as g,p as D,a1 as He,X as H,a5 as fe,x as G,a7 as me,c as Ue,a0 as Z,v as ze,W as ge,r as R,s as ee,Z as Xe,U as Qe}from"./f1mhg7ek.js";import{l as Ke}from"./Df9QhM0P.js";function k(e){return JSON.stringify(e).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function Ye(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ze(e){return e.replace(/<\/script/gi,"<\\/script")}const et={id:"javascript",label:"JavaScript",languages:["javascript"],layout:"console",usesVendor:!1,build:({content:e})=>({body:`<script>${Ze(e)}<\/script>`})},tt={id:"html",label:"HTML",languages:["html"],layout:"preview",usesVendor:!1,build:({content:e})=>({bare:!0,body:e.replace(/^\s*<!doctype[^>]*>/i,"")})},p={markdown:"markdown/markdown.min.js",papaParse:"papaparse/papaparse.min.js",pyodide:"pyodide/pyodide.js",pyodideIndex:"pyodide/",wasmoon:"wasmoon/index.js",wasmoonGlue:"wasmoon/glue.wasm",sqlJs:"sql.js/sql-wasm.js",sqlJsDir:"sql.js/",pglite:"pglite/index.js",typescript:"typescript/typescript.js",coffeescript:"coffeescript/coffeescript.js",babel:"babel/babel.min.js",react:"react/react.production.min.js",reactDom:"react/react-dom.production.min.js",vue:"vue/vue.global.js",vueSfcLoader:"vue/vue3-sfc-loader.js",svelteCompiler:"svelte/compiler/index.js",svelteIndexClient:"svelte/src/index-client.js",svelteInternalClient:"svelte/src/internal/client/index.js",svelteDiscloseVersion:"svelte/src/internal/disclose-version.js",svelteFlagsLegacy:"svelte/src/internal/flags/legacy.js",svelteEsmEnv:"svelte/esm-env/index.js",svelteEsmEnvBrowser:"svelte/esm-env/browser-fallback.js",svelteEsmEnvDevelopment:"svelte/esm-env/dev-fallback.js",svelteEsmEnvNode:"svelte/esm-env/false.js",svelteClsx:"svelte/clsx/clsx.mjs",rubyScript:"ruby-wasm/browser.umd.js",rubyWasm:"ruby-wasm/ruby+stdlib.wasm",phpWeb:"php-wasm/PhpWeb.mjs",mermaid:"mermaid/mermaid.min.js",jscpp:"jscpp/JSCPP.es5.min.js",picoc:"picoc-js/bundle.umd.js"},nt={id:"typescript",label:"TypeScript",languages:["typescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.typescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    var js = ts.transpile(CODE, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None });
    (0, eval)(js);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},rt={id:"coffeescript",label:"CoffeeScript",languages:["coffeescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.coffeescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    (0, eval)(CoffeeScript.compile(CODE, { bare: true }));
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},ot={id:"mermaid",label:"Mermaid",languages:["mermaid"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.mermaid}"><\/script>`,body:`<pre class="mermaid">${Ye(e)}</pre>
<script>
try {
  mermaid.initialize({ startOnLoad: true, securityLevel: "strict", theme: "default" });
} catch (e) { console.error(String(e)); }
<\/script>`})},st=`<style>
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
</style>`,at={id:"markdown-preview",label:"Markdown preview",languages:["markdown"],layout:"preview",usesVendor:!0,noRepl:!0,defaultTab:"console",build:({content:e,vendorBase:t,theme:n})=>({head:`${st}<script src="${t}/${p.markdown}"><\/script><script src="${t}/${p.mermaid}"><\/script>`,body:`<main class="markdown-preview" data-theme="${n}"></main>
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
    document.querySelector(".markdown-preview").innerHTML = md.render(${k(e)});
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: ${k(n==="dark"?"dark":"default")} });
    mermaid.run({ querySelector: ".markdown-preview .mermaid" }).catch(function (e) { console.error(String(e)); });
  } catch (e) { console.error(String(e)); }
})();
<\/script>`})},lt={id:"react",label:"React (Babel)",languages:["jsx","javascript"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.react}"><\/script><script src="${t}/${p.reactDom}"><\/script><script src="${t}/${p.babel}"><\/script>`,body:`<div id="root"></div>
<script>
(function () {
  var CODE = ${k(e)};
  try {
    // The react preset alone leaves ES module syntax untouched, so a note
    // starting with "export default function App()" is a SyntaxError for
    // eval/new Function. The commonjs transform rewrites import/export into
    // require/exports, which the shims below satisfy.
    var compiled = Babel.transform(CODE, {
      presets: ["react"],
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
<\/script>`})},it={id:"python-pyodide",label:"Python (Pyodide)",languages:["python"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"Python",build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.pyodide}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Python (Pyodide)…");
  // Defined before the interpreter loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "Python is still loading…"; };
  try {
    var py = await loadPyodide({ indexURL: "${t}/${p.pyodideIndex}" });
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
<\/script>`})},ct={id:"lua-wasmoon",label:"Lua (wasmoon)",languages:["lua"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.wasmoon}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Lua (wasmoon)…");
  try {
    var factory = new wasmoon.LuaFactory("${t}/${p.wasmoonGlue}");
    var lua = await factory.createEngine();
    lua.global.set("print", function () {
      console.log(Array.prototype.slice.call(arguments).map(String).join("\\t"));
    });
    await lua.doString(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},ut={id:"ruby-wasm",label:"Ruby (ruby.wasm)",languages:["ruby"],layout:"console",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.rubyScript}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Ruby (ruby.wasm)…");
  try {
    // arrayBuffer + compile (not compileStreaming): independent of the
    // Content-Type the host serves .wasm with.
    var response = await fetch("${t}/${p.rubyWasm}");
    if (!response.ok) throw new Error("failed to load ruby.wasm: " + response.status);
    var module = await WebAssembly.compile(await response.arrayBuffer());
    // consolePrint defaults to true: puts/warn land in console.*, which the
    // sandbox bootstrap relays to the panel.
    var booted = await window["ruby-wasm-wasi"].DefaultRubyVM(module);
    booted.vm.eval(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},dt={id:"sql-sqljs",label:"SQLite (sql.js)",languages:["sql"],layout:"console",usesVendor:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.sqlJs}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
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
    var SQL = await initSqlJs({ locateFile: function (f) { return "${t}/${p.sqlJsDir}" + f; } });
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
<\/script>`})},pt={id:"sql-pglite",label:"PostgreSQL (PGlite)",languages:["sql"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({body:`<script type="module">
const CODE = ${k(e)};
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
  const { PGlite } = await import("${t}/${p.pglite}");
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
<\/script>`})},ft={id:"php-wasm",label:"PHP (php-wasm)",languages:["php"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({body:`<div id="php-out"></div>
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
const CODE = ${k(e)};
try {
  const { PhpWeb } = await import("${t}/${p.phpWeb}");
  const php = new PhpWeb();
  const out = document.getElementById("php-out");
  let stdout = "";
  php.addEventListener("output", function (e) { stdout += e.detail[0]; out.innerHTML = stdout; });
  php.addEventListener("error", function (e) { console.error(e.detail[0]); });
  const exitCode = await php.run(CODE);
  if (exitCode) console.warn("PHP exited with code: " + exitCode);
} catch (e) { console.error(String(e && e.message || e)); }
<\/script>`})},mt={id:"cpp-jscpp",label:"C++ (JSCPP interpreter)",languages:["cpp"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>{const n=e.replace(/\bstd::/g,""),r=n!==e;return{head:`<script src="${t}/${p.jscpp}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(n)};
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
<\/script>`}}},gt={id:"c-picoc",label:"C (PicoC interpreter)",languages:["c"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.picoc}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    picocjs.runC(CODE, function (line) { console.log(line); });
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},vt={id:"vue-sfc",label:"Vue SFC",languages:["vue"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${p.vue}"><\/script><script src="${t}/${p.vueSfcLoader}"><\/script>`,body:`<div id="app"></div>
<script>
(function () {
  var CODE = ${k(e)};
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
<\/script>`})},bt={id:"svelte",label:"Svelte",languages:["svelte"],layout:"preview",usesVendor:!0,scriptBlob:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script type="importmap">${k({imports:{svelte:`${t}/${p.svelteIndexClient}`,"svelte/internal/client":`${t}/${p.svelteInternalClient}`,"svelte/internal/disclose-version":`${t}/${p.svelteDiscloseVersion}`,"svelte/internal/flags/legacy":`${t}/${p.svelteFlagsLegacy}`,"esm-env":`${t}/${p.svelteEsmEnv}`,"esm-env/browser":`${t}/${p.svelteEsmEnvBrowser}`,"esm-env/development":`${t}/${p.svelteEsmEnvDevelopment}`,"esm-env/node":`${t}/${p.svelteEsmEnvNode}`,clsx:`${t}/${p.svelteClsx}`}})}<\/script><script src="${t}/${p.svelteCompiler}"><\/script>`,body:`<div id="app"></div>
<script type="module">
const CODE = ${k(e)};
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
<\/script>`})};function ht(e,t,n,r){const o=[],s=d=>d==null?"":typeof d=="object"?JSON.stringify(d):String(d),y=d=>{let c=d,i=2;for(;o.some(u=>u.name===c);)c=`${d} (${i++})`;return c};if(t==="json"){let d;try{d=JSON.parse(e)}catch(i){return{tables:o,error:`Invalid JSON: ${String(i)}`}}const c=(i,u)=>{if(!u.length||!u.every(_=>_!==null&&typeof _=="object"&&!Array.isArray(_)))return;const m=u,E=[...new Set(m.flatMap(_=>Object.keys(_)))];E.length&&o.push({name:y(i),columns:E,rows:m.map(_=>E.map(S=>s(_[S])))})};if(Array.isArray(d))c("data",d);else if(d!==null&&typeof d=="object")for(const[i,u]of Object.entries(d))Array.isArray(u)&&c(i,u)}else if(t==="csv"){if(!r)return{tables:o,error:"CSV parser failed to load"};const d=r.parse(e,{delimiter:"",delimitersToGuess:[",","	",";"],dynamicTyping:!1,skipEmptyLines:"greedy"});if(d.errors.length)return{tables:o,error:`CSV parse error: ${d.errors[0].message}`};const c=d.data;if(c.length>=2&&c[0].length>=2){const i=c[0];if(c.slice(1).some(u=>u.length!==i.length))return{tables:o,error:"CSV parse error: inconsistent row width"};o.push({name:"data",columns:i,rows:c.slice(1)})}}else if(t==="markdown"&&n){const d=new n().parse(e,{});let c=null,i=0,u=null,m=[],E=!1,_=!1;for(const S of d)if(S.type==="heading_open")E=!0;else if(S.type==="heading_close")E=!1;else if(S.type==="table_open")u={name:y(c??`Table ${++i}`),columns:[],rows:[]};else if(S.type==="tr_open"&&u)m=[];else if((S.type==="th_open"||S.type==="td_open")&&u)_=!0;else if((S.type==="th_close"||S.type==="td_close")&&u)_=!1;else if(S.type==="inline"){const P=S.children?.filter($=>$.type==="text"||$.type==="code_inline").map($=>$.content).join("")??S.content;E?c=P||null:u&&_&&m.push(P)}else S.type==="tr_close"&&u?u.columns.length?u.rows.push(m):u.columns=m:S.type==="table_close"&&u&&(o.push(u),u=null)}return o.length?{tables:o}:{tables:o,message:"No tabular data found"}}function wt(e,t){const n=e.find(i=>i.name===t.table);if(!n)throw new Error(`unknown table: ${t.table}`);const r=String(t.search??"").toLocaleLowerCase(),o=r?n.rows.filter(i=>i.some(u=>u.toLocaleLowerCase().includes(r))):n.rows,s=n.columns.indexOf(t.sortBy??""),y=s<0?o:o.map((i,u)=>({row:i,index:u})).sort((i,u)=>{const m=(i.row[s]??"").localeCompare(u.row[s]??"",void 0,{numeric:!0,sensitivity:"base"});return(t.sortDir==="desc"?-m:m)||i.index-u.index}).map(({row:i})=>i),d=Math.max(0,Math.floor(Number(t.offset)||0)),c=Math.min(50,Math.max(1,Math.floor(Number(t.limit)||50)));return{rows:y.slice(d,d+c),total:y.length}}const yt={id:"data-tables",label:"Data tables",languages:["csv","json","markdown"],layout:"console",tables:!0,defaultTab:"tables",noRepl:!0,usesVendor:!0,build:({content:e,vendorBase:t,languageId:n})=>({head:`<script src="${t}/${p.markdown}"><\/script><script src="${t}/${p.papaParse}"><\/script>`,body:`<script>
(function () {
  var source = ${k(e)};
  var language = ${k(n??"csv")};
  var parse = (${ht.toString()});
  var query = (${wt.toString()});
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
<\/script>`})},St=[et,tt,nt,rt,ot,at,lt,it,ct,ut,dt,pt,ft,mt,gt,vt,bt,yt];function $e(e){return e?St.filter(t=>t.languages.includes(e)):[]}function $n(e){return $e(e).length>0}const Rn=globalThis.setInterval,xt={class:"flex-grow basis-0 overflow-auto flex flex-col text-xs font-mono min-h-0"},kt={key:0,class:"flex-grow flex items-center justify-center text-white/50 px-4 text-center"},Et={class:"flex items-center gap-2 px-2 py-1 border-b border-black flex-wrap"},_t=["value"],$t=["value"],Rt=["value"],Ct={class:"overflow-auto flex-grow min-h-0"},Ot={class:"border-collapse w-full"},Lt={class:"sticky top-0 bg-[#111]"},At=["onClick"],Tt={key:0},Nt={key:0},jt=["colspan"],qt={class:"flex items-center gap-2 px-2 py-1 border-t border-black"},Mt=["disabled"],Dt=["disabled"],Pt={key:0,class:"text-white/50"},It=_e({__name:"sandbox-tables",props:{tables:{},selected:{},columns:{},rows:{},total:{},offset:{},limit:{},sortBy:{},sortDir:{},search:{},loading:{type:Boolean}},emits:["select","search","sort","page","refresh"],setup(e){return(t,n)=>(b(),w("div",xt,[e.tables.length?(b(),w(L,{key:1},[v("div",Et,[v("select",{value:e.selected,class:"bg-black border border-white/40 rounded-sm py-0.5",onChange:n[0]||(n[0]=r=>t.$emit("select",r.target.value))},[(b(!0),w(L,null,T(e.tables,r=>(b(),w("option",{key:r.name,value:r.name},C(r.name)+" ("+C(r.rowCount)+") ",9,$t))),128))],40,_t),v("input",{value:e.search,placeholder:"Search…",class:"bg-transparent border border-white/40 rounded-sm px-1 py-0.5 outline-none",onInput:n[1]||(n[1]=r=>t.$emit("search",r.target.value))},null,40,Rt),v("button",{class:"border border-white/40 px-2 rounded-sm hover:bg-white/10",onClick:n[2]||(n[2]=r=>t.$emit("refresh"))}," Refresh ")]),v("div",Ct,[v("table",Ot,[v("thead",Lt,[v("tr",null,[(b(!0),w(L,null,T(e.columns,r=>(b(),w("th",{key:r,class:"text-left px-2 py-1 border-b border-white/20 cursor-pointer select-none whitespace-nowrap",onClick:o=>t.$emit("sort",r)},[ne(C(r)+" ",1),e.sortBy===r?(b(),w("span",Tt,C(e.sortDir==="asc"?"▲":"▼"),1)):A("",!0)],8,At))),128))])]),v("tbody",null,[(b(!0),w(L,null,T(e.rows,(r,o)=>(b(),w("tr",{key:o,class:"odd:bg-white/5"},[(b(!0),w(L,null,T(r,(s,y)=>(b(),w("td",{key:y,class:"px-2 py-0.5 whitespace-nowrap max-w-64 overflow-hidden text-ellipsis"},C(s),1))),128))]))),128)),e.rows.length?A("",!0):(b(),w("tr",Nt,[v("td",{colspan:e.columns.length,class:"px-2 py-2 text-white/50"},"No rows.",8,jt)]))])])]),v("div",qt,[v("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset===0,onClick:n[3]||(n[3]=r=>t.$emit("page",-1))},"‹",8,Mt),v("span",null,C(e.total?e.offset+1:0)+"–"+C(Math.min(e.offset+e.rows.length,e.total))+" of "+C(e.total),1),v("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset+e.limit>=e.total,onClick:n[4]||(n[4]=r=>t.$emit("page",1))},"›",8,Dt),e.loading?(b(),w("span",Pt,"loading…")):A("",!0)])],64)):(b(),w("div",kt," No tables found. Run a note that creates a table or contains tabular data. "))]))}}),Bt=Object.assign(It,{__name:"EditorSandboxTables"});let Vt="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",ve=(e=21)=>{let t="",n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=Vt[n[e]&63];return t};const Re=64*1024,Ft=10;function Gt(e){let t=e.flags;return t.includes("g")||(t+="g"),t.includes("m")||(t+="m"),new RegExp(e.source,t)}function Wt(e){const t=e.slice(0,Re).trimStart();if(t.startsWith("{")||t.startsWith("<")||t.startsWith("["))return!1;const n=t.split(/\r?\n/);for(const r of[",",";","	"]){const o=s=>{const y=[];let d="",c=!1;for(let i=0;i<s.length;i++){const u=s[i];u==='"'?c&&s[i+1]==='"'?(d+='"',i++):c=!c:u===r&&!c?(y.push(d.trim()),d=""):d+=u}return y.push(d.trim()),c?null:y};for(let s=0;s<=n.length-3;s++){const y=n.slice(s,s+3);if(y.some(m=>/^\s*[<{]/.test(m)))continue;const d=y.map(o);if(d.some(m=>m===null))continue;const[c,i,u]=d;if(!(c.length<3||c.length!==i.length||c.length!==u.length)&&!c.some(m=>!m||m.split(/\s+/).length>2)&&![c,i,u].some(m=>m.some(E=>/[.!?]$/.test(E))))return!0}}return!1}function Cn(e){if(!e.trim())return"plaintext";if(Wt(e))return"csv";const t=e.slice(0,Re),n=Ke.filter(r=>r.detectionPatterns&&r.detectionPatterns.length>0).map(r=>{const o=r.detectionPatterns.reduce((s,{pattern:y,weight:d=1})=>{const c=t.match(Gt(y))?.length??0;return s+Math.min(c,Ft)*d},0);return{languageId:r.id,score:o}});return n.sort((r,o)=>o.score-r.score),n.length>0&&n[0].score>0?n[0].languageId:"plaintext"}function be(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e(...r),t)}}const U="not3/sandbox/console",re="not3/sandbox/ready",Ce="not3/sandbox/eval",Oe="not3/sandbox/tables/request",z="not3/sandbox/tables/result",Le="not3/sandbox/rows/request",X="not3/sandbox/rows/result",Jt=["log","info","warn","error","debug","clear"],Ht=1e3,Ut=200,he=1e4,zt=500,Ae=200,Xt=200,Qt=new Set(["background","background-attachment","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","border","border-bottom","border-color","border-left","border-radius","border-right","border-style","border-top","border-width","box-decoration-break","box-shadow","color","cursor","display","font","font-family","font-size","font-stretch","font-style","font-variant","font-weight","letter-spacing","line-height","margin","margin-bottom","margin-left","margin-right","margin-top","opacity","outline","outline-color","outline-style","outline-width","padding","padding-bottom","padding-left","padding-right","padding-top","text-decoration","text-decoration-color","text-decoration-line","text-decoration-style","text-shadow","text-transform","vertical-align","white-space","word-break","word-spacing","word-wrap"]),Kt=/url\(|image-set\(|@import|expression\(|javascript:|[\\<>{}]/i;function Yt(e){if(!e||e.length>Ht)return"";const t=[];for(const n of e.split(";")){const r=n.indexOf(":");if(r===-1)continue;const o=n.slice(0,r).trim().toLowerCase(),s=n.slice(r+1).trim();!s||!Qt.has(o)||Kt.test(s)||t.push(`${o}: ${s}`)}return t.join("; ")}function Zt(e){if(!(!Array.isArray(e)||e.length===0))return e.slice(0,Ut).map(t=>{const n=typeof t=="object"&&t!==null?t:{},r="text"in n?n.text:t;return{text:typeof r=="string"?r:String(r),css:typeof n.css=="string"?Yt(n.css):""}})}function oe(e){const t=typeof e=="string"?e:String(e);return t.length>he?t.slice(0,he)+"…":t}function se(e){const t=Number(e);return Number.isFinite(t)?t:null}function en(e){return Array.isArray(e)?e.slice(0,zt).map(t=>{const n=typeof t=="object"&&t!==null?t:{},r=Array.isArray(n.columns)?n.columns.slice(0,Ae).map(oe):[];return{name:oe(n.name),columns:r,rowCount:se(n.rowCount)??0}}):null}function tn(e){return Array.isArray(e)?e.slice(0,Xt).map(t=>Array.isArray(t)?t.slice(0,Ae).map(oe):[]):null}function nn(e,t){if(typeof e!="object"||e===null)return null;const n=e;if(n.token!==t)return null;if(n.type===re)return{type:re};if(n.type===z){const o=en(n.tables);return o?{type:z,tables:o}:null}if(n.type===X){const o=se(n.id),s=se(n.total),y=tn(n.rows);return o===null||s===null||!y?null:{type:X,id:o,total:s,rows:y}}if(n.type!==U||!Jt.includes(n.level)||!Array.isArray(n.args))return null;const r=Zt(n.segments);return{type:U,level:n.level,args:n.args.map(o=>typeof o=="string"?o:String(o)),...r?{segments:r}:{}}}function rn(e){return`
(function () {
  var TOKEN = ${JSON.stringify(e)};
  var CONSOLE_MSG = ${JSON.stringify(U)};
  var EVAL_MSG = ${JSON.stringify(Ce)};
  var READY_MSG = ${JSON.stringify(re)};
  var TABLES_REQ = ${JSON.stringify(Oe)};
  var TABLES_RES = ${JSON.stringify(z)};
  var ROWS_REQ = ${JSON.stringify(Le)};
  var ROWS_RES = ${JSON.stringify(X)};
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
`}const on="allow-scripts allow-modals";function sn(e){const t=e.allowNetwork?" https:":"",n=e.vendorOrigin?` ${e.vendorOrigin}`:"",r=e.scriptBlob?" blob:":"",o=[...e.vendorOrigin?[e.vendorOrigin]:[],...e.allowNetwork?["https:","wss:"]:[]],s=["default-src 'none'",`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${r}${n}${t}`,`style-src 'unsafe-inline'${n}${t}`,`img-src data: blob:${n}${t}`,`font-src data:${n}${t}`,`media-src data: blob:${n}${t}`];return(e.vendorOrigin||e.scriptBlob)&&s.push(`worker-src blob:${n}`),s.push(`connect-src ${o.length?o.join(" "):"'none'"}`,"form-action 'none'","base-uri 'none'"),s.join("; ")}function an(e,t){const n=(t||"/").replace(/^\/*/,"/").replace(/\/*$/,"/");return`${e.replace(/\/$/,"")}${n}vendor`}function ln(e){const t=e.runner.build({content:e.content,languageId:e.languageId,vendorBase:an(e.origin,e.basePath),theme:e.theme}),r=`<meta http-equiv="Content-Security-Policy" content="${sn({allowNetwork:e.allowNetwork,vendorOrigin:e.runner.usesVendor?e.origin:null,scriptBlob:e.runner.scriptBlob===!0})}"><script>${rn(e.token)}<\/script>`+(t.head??"");if(t.bare)return"<!doctype html>"+r+t.body;const o=e.runner.layout==="preview"?"<style>body{background:#fff}</style>":"<style>body{background:#1e1e1e}</style>";return"<!doctype html><html><head>"+r+o+"</head><body>"+t.body+"</body></html>"}function we(e,t,n,r){return t&&e.set(t,n),e.get(r.id)??!r.heavy}function ye(e){return e.tables&&e.defaultTab==="tables"?"tables":"console"}const cn=100;function un(){const e=new Map,t=n=>{let r=e.get(n);return r||(r={commands:[],cursor:null,draft:""},e.set(n,r)),r};return{record(n,r){if(!r)return;const o=t(n);o.commands.push(r),o.commands.length>cn&&o.commands.shift(),o.cursor=null,o.draft=""},navigate(n,r,o){const s=t(n);return s.commands.length?r==="up"?(s.cursor===null?(s.draft=o,s.cursor=s.commands.length-1):s.cursor=Math.max(0,s.cursor-1),s.commands[s.cursor]):s.cursor===null?o:s.cursor===s.commands.length-1?(s.cursor=null,s.draft):s.commands[++s.cursor]:o},switchRunner(n,r,o){if(n){const s=t(n);s.cursor===null&&(s.draft=o),s.cursor=null}return t(r).draft}}}const dn={class:"w-full h-full flex flex-col bg-[#111] text-white min-w-0 min-h-0"},pn={class:"flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap"},fn={class:"font-bold select-none"},mn=["value"],gn={class:"flex items-center gap-1 select-none cursor-pointer",title:"Re-run automatically when the note changes"},vn={class:"flex items-center gap-1 select-none cursor-pointer",title:"Allow the sandbox to load resources from and connect to https:// hosts. Off by default so note code cannot send data anywhere."},bn=["srcdoc","sandbox"],hn={key:0,class:"flex items-center gap-1 px-2 py-1 bg-black/60 text-xs"},wn=["onClick"],yn=["placeholder"],Se=500,te=50,Sn=700,xn=15,kn=_e({__name:"sandbox-panel",props:{content:{},languageId:{},popout:{type:Boolean},resizing:{type:Boolean}},emits:["close","popout","engine"],setup(e,{emit:t}){const n=e,r=t,o={log:"text-gray-100",info:"text-blue-300",warn:"text-yellow-400",error:"text-red-400",debug:"text-gray-500",input:"text-green-400"},{uiBaseURL:s}=Ge().public,y=R(),d=R(),c=R([]),i=R(""),u=un(),m=R(!0),E=R(!1),_=R("");let S="";const P=new Map,$=R("");F($,a=>r("engine",a));const q=ee(()=>$e(n.languageId)),x=ee(()=>q.value.find(a=>a.id===$.value)??q.value[0]??null),N=R("console"),M=R([]),O=R(""),f=R({rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1});let ae=0,W=null,le=0;const Te=ee(()=>M.value.find(a=>a.name===O.value)?.columns??[]);function K(a){y.value?.contentWindow?.postMessage({...a,token:S},"*")}function J(){W&&clearTimeout(W),W=null}function Y(){if(!x.value?.tables)return;J(),le=0;const a=()=>{K({type:Oe}),++le<xn&&(W=setTimeout(a,Sn))};a()}function I(){O.value&&(f.value.loading=!0,K({type:Le,query:{id:++ae,table:O.value,offset:f.value.offset,limit:te,sortBy:f.value.sortBy??void 0,sortDir:f.value.sortDir,search:f.value.search||void 0}}))}function ie(){J(),M.value=[],O.value="",f.value={rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1}}function Ne(a){N.value=a,a==="tables"&&Y()}function je(a){O.value=a,f.value.offset=0,f.value.sortBy=null,f.value.sortDir="asc",f.value.search="",I()}const qe=be(I,300);function Me(a){f.value.search=a,f.value.offset=0,qe()}function De(a){f.value.sortBy===a?f.value.sortDir=f.value.sortDir==="asc"?"desc":"asc":(f.value.sortBy=a,f.value.sortDir="asc"),I()}function Pe(a){f.value.offset=Math.max(0,f.value.offset+a*te),I()}function Ie(a){return a.segments??[{text:a.text,css:""}]}function ce(a){c.value.push(a),c.value.length>Se&&c.value.splice(0,c.value.length-Se),Xe(()=>d.value?.scrollTo({top:d.value.scrollHeight}))}function B(){x.value&&(N.value=ye(x.value),c.value=[],ie(),S=ve(),_.value=ln({runner:x.value,content:n.content,languageId:n.languageId,token:S,allowNetwork:E.value,origin:window.location.origin,basePath:s,theme:"dark"}),x.value.tables&&Y())}function ue(a){if(!y.value||a.source!==y.value.contentWindow)return;const l=nn(a.data,S);if(l){if(l.type===z){J(),M.value=l.tables,M.value.some(j=>j.name===O.value)||(O.value=M.value[0]?.name??"",f.value.offset=0),O.value&&I();return}if(l.type===X){if(l.id!==ae)return;f.value.rows=l.rows,f.value.total=l.total,f.value.loading=!1;return}l.type===U&&(l.level==="clear"?c.value=[]:ce({level:l.level,text:l.args.join(" "),segments:l.segments}))}}function Be(){const a=i.value.trim();!a||!y.value?.contentWindow||(x.value&&u.record(x.value.id,a),ce({level:"input",text:"> "+a}),N.value="console",K({type:Ce,code:a}),i.value="")}function de(a){x.value&&(i.value=u.navigate(x.value.id,a,i.value))}const Ve=be(()=>{m.value&&B()},1e3);return F(()=>n.content,()=>Ve()),F(E,B),F(q,a=>{a.some(l=>l.id===$.value)||($.value=a[0]?.id??"")}),F([x,()=>n.languageId],([a,l],[j,h])=>{if(!a){r("close");return}const V=a.id!==j?.id;!V&&l===h||(V&&(i.value=u.switchRunner(j?.id??"",a.id,i.value),m.value=we(P,j?.id??null,m.value,a)),N.value=ye(a),m.value?B():(S=ve(),c.value=[],ie(),_.value=""))}),We(()=>{window.addEventListener("message",ue),$.value=q.value[0]?.id??"",m.value=x.value?we(P,null,m.value,x.value):!0,B()}),Je(()=>{window.removeEventListener("message",ue),J()}),(a,l)=>{const j=Bt;return b(),w("div",dn,[v("div",pn,[v("span",fn,C(g(x)?.label||"Sandbox"),1),g(q).length>1?D((b(),w("select",{key:0,"onUpdate:modelValue":l[0]||(l[0]=h=>H($)?$.value=h:null),class:"panel-select",title:"Execution engine for this language"},[(b(!0),w(L,null,T(g(q),h=>(b(),w("option",{key:h.id,value:h.id},C(h.label),9,mn))),128))],512)),[[He,g($)]]):A("",!0),v("button",{class:"panel-btn",onClick:B},"Run"),v("button",{class:"panel-btn",onClick:l[1]||(l[1]=h=>c.value=[])},"Clear"),v("label",gn,[D(v("input",{"onUpdate:modelValue":l[2]||(l[2]=h=>H(m)?m.value=h:null),type:"checkbox"},null,512),[[fe,g(m)]]),l[9]||(l[9]=ne(" auto ",-1))]),v("label",vn,[D(v("input",{"onUpdate:modelValue":l[3]||(l[3]=h=>H(E)?E.value=h:null),type:"checkbox"},null,512),[[fe,g(E)]]),l[10]||(l[10]=ne(" network ",-1))]),l[11]||(l[11]=v("div",{class:"flex-grow"},null,-1)),e.popout?A("",!0):(b(),w("button",{key:1,class:"panel-btn",title:"Move this panel into a separate window",onClick:l[4]||(l[4]=h=>a.$emit("popout"))},"Popout")),v("button",{class:G(e.popout?"panel-btn":"panel-btn sm:hidden"),onClick:l[5]||(l[5]=h=>a.$emit("close"))},"Close",2)]),v("iframe",{ref_key:"iframe",ref:y,srcdoc:g(_),sandbox:g(on),referrerpolicy:"no-referrer",class:G([g(x)?.layout==="preview"?"w-full flex-grow bg-white border-none":"hidden",e.resizing?"pointer-events-none":""])},null,10,bn),g(x)?.tables?(b(),w("div",hn,[(b(),w(L,null,T(["console","tables"],h=>v("button",{key:h,class:G(["px-2 rounded-sm border border-white/40 capitalize",g(N)===h?"bg-white/20":"hover:bg-white/10"]),onClick:V=>Ne(h)},C(h),11,wn)),64))])):A("",!0),g(x)?.tables?D((b(),Ue(j,{key:1,tables:g(M),selected:g(O),columns:g(Te),rows:g(f).rows,total:g(f).total,offset:g(f).offset,limit:te,"sort-by":g(f).sortBy,"sort-dir":g(f).sortDir,search:g(f).search,loading:g(f).loading,onSelect:je,onSearch:Me,onSort:De,onPage:Pe,onRefresh:Y},null,8,["tables","selected","columns","rows","total","offset","sort-by","sort-dir","search","loading"])),[[me,g(N)==="tables"]]):A("",!0),D(v("div",{ref_key:"output",ref:d,class:G(["overflow-y-auto font-mono text-xs px-2 py-1",g(x)?.layout==="preview"?"h-48 border-t border-black flex-shrink-0":"flex-grow basis-0"])},[(b(!0),w(L,null,T(g(c),(h,V)=>(b(),w("div",{key:V,class:G(["whitespace-pre-wrap break-all",o[h.level]])},[(b(!0),w(L,null,T(Ie(h),(pe,Fe)=>(b(),w("span",{key:Fe,style:Qe(pe.css)},C(pe.text),5))),128))],2))),128))],2),[[me,g(N)==="console"]]),g(x)?.noRepl?A("",!0):(b(),w("form",{key:2,class:"flex items-center border-t border-black",onSubmit:Z(Be,["prevent"])},[l[12]||(l[12]=v("span",{class:"pl-2 pr-1 py-1 text-green-400 font-mono text-xs select-none"},">",-1)),D(v("input",{"onUpdate:modelValue":l[6]||(l[6]=h=>H(i)?i.value=h:null),class:"flex-grow bg-transparent font-mono text-xs py-1 pr-2 outline-none",placeholder:`Run ${g(x)?.replLanguage??"JavaScript"} in the sandbox…`,onKeydown:[l[7]||(l[7]=ge(Z(h=>de("up"),["prevent"]),["up"])),l[8]||(l[8]=ge(Z(h=>de("down"),["prevent"]),["down"]))]},null,40,yn),[[ze,g(i)]])],32))])}}}),On=Object.assign(kn,{__name:"EditorSandboxPanel"}),xe="not3/popout/ready",ke="not3/popout/state",Ee="not3/popout/engine";function Ln(e){if(typeof e!="object"||e===null)return null;const t=e;return t.type===xe?{type:xe}:t.type===Ee?t.engineId!=="sql-sqljs"&&t.engineId!=="sql-pglite"?null:{type:Ee,engineId:t.engineId}:t.type!==ke||typeof t.content!="string"||typeof t.languageId!="string"?null:{type:ke,content:t.content,languageId:t.languageId}}let Q=null;function An(e){Q=e}function Tn(){return Q}function Nn(){try{Q?.close()}catch{}Q=null}export{xe as P,On as _,ke as a,Ee as b,An as c,Nn as d,be as e,Cn as f,Tn as g,$n as i,Wt as l,Ln as p,Rn as s};
