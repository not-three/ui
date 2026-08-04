import{d as be,g as d,F as E,i as a,B as k,j as T,t as v,o as p,E as Y,H as qe,w as B,e as Ne,f as je,a as c,p as D,C as Me,s as V,J as ue,k as N,K as pe,c as Ie,v as Be,L as Ve,r as b,x as Q,M as Fe,n as Ge,_ as Je}from"./DUd590NQ.js";const We={id:"typescript",extensions:[".ts",".tsx"],aliases:["TypeScript","ts","typescript"],mimeTypes:["application/typescript"],detectionPatterns:[{pattern:/^[\s\n]*(import|export)\s+.*from\s+['"]/,weight:2},{pattern:/^[\s\n]*(interface|type|class)\s+\w+/,weight:2},{pattern:/:\s*(string|number|boolean|any)\b/,weight:1},{pattern:/\basync\s+function\b/,weight:1}]},Ue={id:"javascript",extensions:[".js",".jsx",".mjs",".cjs"],aliases:["JavaScript","js","javascript"],mimeTypes:["application/javascript"],detectionPatterns:[{pattern:/^[\s\n]*(import|export)\s+.*from\s+['"]/,weight:1},{pattern:/^[\s\n]*const\s+\w+\s*=\s*require\(/,weight:2},{pattern:/\bfunction\s*\*?\s*\w+\s*\(/,weight:2},{pattern:/\bclass\s+\w+(\s+extends\s+\w+)?/,weight:1},{pattern:/\bconsole\.(log|error|warn|info|debug)\s*\(/,weight:2},{pattern:/\b(document|window)\.\w+/,weight:2},{pattern:/\b(const|let)\s+\w+\s*[=;]/,weight:1},{pattern:/\([^()]*\)\s*=>|\b\w+\s*=>/,weight:1},{pattern:/`[^`]*\$\{[^}]*\}[^`]*`/,weight:2},{pattern:/===|!==/,weight:1}]},ze={id:"json",extensions:[".json",".jsonc"],aliases:["JSON","json"],mimeTypes:["application/json"],detectionPatterns:[{pattern:/^[\s\n]*(\{|\[)[\s\n]*"/,weight:2},{pattern:/^[\s\n]*\{[\s\n]*"[^"]+"\s*:/,weight:2}]},He={id:"yaml",extensions:[".yml",".yaml"],aliases:["YAML","yaml"],mimeTypes:["text/x-yaml"],detectionPatterns:[{pattern:/^[\s\n]*---/,weight:2},{pattern:/^[\s\n]*[\w-]+:\s*[|[{]?/,weight:1},{pattern:/^[\s\n]*-\s+\w+:\s/,weight:1}]},Xe={id:"cpp",extensions:[".cpp",".cc",".cxx",".hpp",".hh",".hxx"],aliases:["C++","cpp"],mimeTypes:["text/x-c++src"],detectionPatterns:[{pattern:/^\s*#include\s+<.*>/,weight:2},{pattern:/^\s*(class|struct)\s+\w+/,weight:2},{pattern:/^\s*template\s*<.*>/,weight:1}]},Qe={id:"go",extensions:[".go"],aliases:["Go","go"],mimeTypes:["text/x-go"],detectionPatterns:[{pattern:/^\s*package\s+\w+/,weight:2},{pattern:/^\s*func\s+(\w+\s*)?\(/,weight:2},{pattern:/^\s*import\s+/,weight:1}]},Ke={id:"c",extensions:[".c",".h"],aliases:["C","c"],mimeTypes:["text/x-csrc"],detectionPatterns:[{pattern:/^\s*#include\s+<.*>/,weight:2},{pattern:/^\s*(int|void|char)\s+\w+\s*\(/,weight:2},{pattern:/^\s*#define\s+\w+/,weight:1}]},Ye={id:"java",extensions:[".java"],aliases:["Java","java"],mimeTypes:["text/x-java-source"],detectionPatterns:[{pattern:/^\s*package\s+\w+(\.\w+)*;/,weight:2},{pattern:/^\s*public\s+(class|interface)\s+\w+/,weight:2},{pattern:/^\s*import\s+/,weight:1}]},Ze={id:"toml",extensions:[".toml"],aliases:["TOML","toml"],mimeTypes:["text/x-toml"],configuration:{comments:{lineComment:"#"},brackets:[["[","]"],["{","}"]],autoClosingPairs:[{open:'"',close:'"'},{open:"'",close:"'"},{open:"[",close:"]"},{open:"{",close:"}"}],surroundingPairs:[{open:'"',close:'"'},{open:"'",close:"'"},{open:"[",close:"]"},{open:"{",close:"}"}]},tokenizer:{defaultToken:"",tokenPostfix:".toml",keywords:["true","false"],tokenizer:{root:[[/#.*$/,"comment"],[/\s+/,""],[/^\s*\[\[.*?\]\]/,"metatag"],[/^\s*\[.*?\]/,"metatag"],[/([A-Za-z_][A-Za-z0-9_-]*)(\s*=\s*)/,["key","delimiter"]],[/"/,{token:"string.quote",next:"@string_double"}],[/'/,{token:"string.quote",next:"@string_single"}],[/-?\d+(\.\d+)?([eE][-+]?\d+)?/,"number"],[/\b(true|false)\b/,"keyword"],[/\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?/,"string.date"]],string_double:[[/[^\\"]+/,"string"],[/\\./,"string.escape"],[/"/,{token:"string.quote",next:"@pop"}],[/./,"string"]],string_single:[[/[^\\']+/,"string"],[/\\./,"string.escape"],[/'/,{token:"string.quote",next:"@pop"}],[/./,"string"]]}},detectionPatterns:[{pattern:/^\s*\[.*\]/,weight:2},{pattern:/^\s*\w+\s*=\s*.+$/,weight:1}]},et={id:"ini",extensions:[".ini",".cfg",".conf"],aliases:["INI","ini"],mimeTypes:["text/x-ini"],detectionPatterns:[{pattern:/^\s*\[.*\]/,weight:2},{pattern:/^\s*\w+\s*=\s*.*$/,weight:1}]},tt={id:"markdown",extensions:[".md",".markdown"],aliases:["Markdown","markdown"],mimeTypes:["text/markdown"],detectionPatterns:[{pattern:/^#{1,6}\s+/,weight:2},{pattern:/^\s*>/,weight:1},{pattern:/^\s*[-*+]\s+/,weight:1}]},nt={id:"python",extensions:[".py",".pyw"],aliases:["Python","python"],mimeTypes:["text/x-python"],detectionPatterns:[{pattern:/^\s*def\s+\w+\s*\(/,weight:2},{pattern:/^\s*class\s+\w+\s*:/,weight:2},{pattern:/^\s*import\s+\w+/,weight:1}]},st={id:"php",extensions:[".php",".phtml",".php3",".php4",".php5",".php7",".php8"],aliases:["PHP","php"],mimeTypes:["application/x-php"],detectionPatterns:[{pattern:/^<\?php/,weight:2},{pattern:/<\?=.*\?>/,weight:1}]},rt={id:"shell",extensions:[".sh",".bash",".ksh",".zsh"],aliases:["Sh","sh"],mimeTypes:["application/x-sh"],detectionPatterns:[{pattern:/^#!\/bin\/sh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+sh/,weight:2},{pattern:/^#!\/bin\/bash/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+bash/,weight:2},{pattern:/^#!\/bin\/ksh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+ksh/,weight:2},{pattern:/^#!\/bin\/zsh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+zsh/,weight:2},{pattern:/^\s*case\s+\w+\s+in/,weight:1},{pattern:/^\s*if\s+\[/,weight:1},{pattern:/^\s*#!/,weight:1}]},ot={id:"html",extensions:[".html",".htm",".xhtml"],aliases:["HTML","html"],mimeTypes:["text/html"],detectionPatterns:[{pattern:/<\s*!DOCTYPE\s+html\s*>/i,weight:2},{pattern:/<\s*html\s*.*?>/i,weight:2},{pattern:/<\s*head\s*.*?>/i,weight:1},{pattern:/<\s*body\s*.*?>/i,weight:1},{pattern:/<\s*script\s*.*?>[\s\S]*?<\/\s*script\s*>/i,weight:2},{pattern:/<\s*link\s+.*?rel\s*=\s*["']stylesheet["'].*?>/i,weight:1},{pattern:/<\s*meta\s+.*?charset\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*div\s+.*?>/i,weight:1},{pattern:/<\s*input\s+.*?type\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*img\s+.*?src\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*a\s+.*?href\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*(h[1-6]|p|span|ul|ol|li|table|tr|td|th|button|section)\s+[a-zA-Z-]+\s*=/i,weight:1},{pattern:/<\s*(h[1-6]|p|span|li|button|td|th)\b[^>]*>[^<]+<\/\s*\1\s*>/i,weight:1}]},it={id:"xml",extensions:[".xml",".xsd",".xsl",".xslt",".svg"],aliases:["XML","xml"],mimeTypes:["application/xml","text/xml","application/atom+xml","application/rss+xml"],detectionPatterns:[{pattern:/<\?xml\s+version\s*=\s*["'][^"']*["']\s*.*?\?>/i,weight:5},{pattern:/\bxmlns(:[\w.-]+)?\s*=\s*["'][^"']*["']/i,weight:3},{pattern:/<\/?[a-zA-Z][\w.-]*:[a-zA-Z][\w.-]*[\s/>]/,weight:3},{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,weight:3},{pattern:/<\?(?!xml\b)[a-zA-Z][\w-]*(\s[^?]*)?\?>/i,weight:2},{pattern:/<!DOCTYPE\s+\w+\s+(SYSTEM|PUBLIC)\b[^>]*>/i,weight:2},{pattern:/<\s*comment\s*.*?>[\s\S]*?<\/\s*comment\s*>/i,weight:1},{pattern:/<\s*\/?\s*\w+[^>]*>/,weight:.05}]},at={id:"sql",extensions:[".sql"],aliases:["SQL","sql"],mimeTypes:["application/sql","text/sql"],detectionPatterns:[{pattern:/SELECT\s+.*?\s+FROM\s+/i,weight:2},{pattern:/INSERT\s+INTO\s+.*?\s+VALUES\s+/i,weight:2},{pattern:/UPDATE\s+.*?\s+SET\s+/i,weight:2},{pattern:/DELETE\s+FROM\s+/i,weight:2},{pattern:/CREATE\s+(TABLE|DATABASE|INDEX)\s+/i,weight:1},{pattern:/DROP\s+(TABLE|DATABASE|INDEX)\s+/i,weight:1},{pattern:/ALTER\s+TABLE\s+/i,weight:1},{pattern:/\bWHERE\b/i,weight:1}]},lt={id:"plaintext",extensions:[".txt"],aliases:["Plaintext","text","plain"],mimeTypes:["text/plain"],detectionPatterns:[]},ct={id:"css",extensions:[".css"],aliases:["CSS","css"],mimeTypes:["text/css"],detectionPatterns:[{pattern:/[.#][\w-]+\s*\{/,weight:2},{pattern:/^\s*[\w-]+\s*:\s*[^;{}]+;\s*$/,weight:1},{pattern:/@(media|import|keyframes|font-face|charset)\b/,weight:3},{pattern:/:(hover|focus|active|first-child|nth-child|last-child)\b/,weight:2},{pattern:/!important\b/,weight:2}]},ut={id:"scss",extensions:[".scss"],aliases:["SCSS","scss"],mimeTypes:["text/x-scss"],detectionPatterns:[{pattern:/\$[\w-]+\s*:\s*[^;]+;/,weight:3},{pattern:/@(mixin|include|extend|use|forward|each|if|else)\b/,weight:3},{pattern:/&[.:#[]/,weight:2},{pattern:/[.#][\w-]+\s*\{/,weight:1}]},pt={id:"less",extensions:[".less"],aliases:["Less","less"],mimeTypes:["text/x-less"],detectionPatterns:[{pattern:/@[\w-]+\s*:\s*[^;]+;/,weight:3},{pattern:/&:extend\(/,weight:4},{pattern:/\.[\w-]+\s*\([^)]*\)\s*;/,weight:2},{pattern:/[.#][\w-]+\s*\{/,weight:1}]},dt={id:"rust",extensions:[".rs"],aliases:["Rust","rust"],mimeTypes:["text/x-rust"],detectionPatterns:[{pattern:/\bfn\s+\w+\s*(<[^>]*>)?\s*\(/,weight:2},{pattern:/\blet\s+mut\s+\w+/,weight:3},{pattern:/\buse\s+\w+(::\w+)+/,weight:3},{pattern:/\b(impl|trait|struct|enum)\s+\w+/,weight:2},{pattern:/\b(println|panic|vec|format)!\s*\(/,weight:3},{pattern:/->\s*&?\w+/,weight:1}]},mt={id:"ruby",extensions:[".rb",".erb"],aliases:["Ruby","ruby","rb"],mimeTypes:["text/x-ruby"],detectionPatterns:[{pattern:/^\s*def\s+\w+/,weight:2},{pattern:/^\s*end\s*$/,weight:2},{pattern:/\brequire(_relative)?\s+['"]/,weight:3},{pattern:/\bputs\s+/,weight:2},{pattern:/\bdo\s*\|[\w\s,]+\|/,weight:3},{pattern:/\battr_(accessor|reader|writer)\b/,weight:4}]},ft={id:"csharp",extensions:[".cs"],aliases:["C#","csharp","cs"],mimeTypes:["text/x-csharp"],detectionPatterns:[{pattern:/\busing\s+System(\.\w+)*\s*;/,weight:4},{pattern:/\bnamespace\s+[\w.]+/,weight:2},{pattern:/\b(public|private|internal|protected)\s+(static\s+)?(class|void|int|string|async)\b/,weight:2},{pattern:/Console\.Write(Line)?\(/,weight:3},{pattern:/\bvar\s+\w+\s*=\s*new\s+\w+/,weight:2}]},gt={id:"kotlin",extensions:[".kt",".kts"],aliases:["Kotlin","kotlin","kt"],mimeTypes:["text/x-kotlin"],detectionPatterns:[{pattern:/\bfun\s+\w+\s*\(/,weight:3},{pattern:/\bdata\s+class\s+\w+/,weight:4},{pattern:/\bcompanion\s+object\b/,weight:4},{pattern:/\b(val|var)\s+\w+\s*:\s*\w+/,weight:2},{pattern:/\bwhen\s*\(/,weight:2}]},ht={id:"swift",extensions:[".swift"],aliases:["Swift","swift"],mimeTypes:["text/x-swift"],detectionPatterns:[{pattern:/\bimport\s+(Foundation|UIKit|SwiftUI|Combine)\b/,weight:4},{pattern:/\bfunc\s+\w+\s*\(/,weight:2},{pattern:/\bguard\s+let\b/,weight:4},{pattern:/@(State|Published|ObservedObject|IBOutlet|IBAction|main)\b/,weight:3},{pattern:/\b(var|let)\s+\w+\s*:\s*\[?\w+\]?[?!]/,weight:2}]},wt={id:"dart",extensions:[".dart"],aliases:["Dart","dart"],mimeTypes:["application/dart"],detectionPatterns:[{pattern:/\bimport\s+'package:/,weight:4},{pattern:/\bvoid\s+main\s*\(\s*\)/,weight:2},{pattern:/\bWidget\s+build\s*\(/,weight:4},{pattern:/\bfinal\s+\w+(<[^>]+>)?\s+\w+\s*=/,weight:2},{pattern:/\b(StatelessWidget|StatefulWidget|BuildContext)\b/,weight:4}]},bt={id:"lua",extensions:[".lua"],aliases:["Lua","lua"],mimeTypes:["text/x-lua"],detectionPatterns:[{pattern:/\blocal\s+\w+\s*=/,weight:3},{pattern:/\bfunction\s+\w+[.:]?\w*\s*\([^)]*\)\s*$/,weight:2},{pattern:/\b(elseif|then)\b/,weight:2},{pattern:/\bnil\b/,weight:1},{pattern:/\bpairs\s*\(|\bipairs\s*\(/,weight:3}]},vt={id:"perl",extensions:[".pl",".pm"],aliases:["Perl","perl"],mimeTypes:["text/x-perl"],detectionPatterns:[{pattern:/\bmy\s+[$@%]\w+/,weight:4},{pattern:/^\s*use\s+(strict|warnings)\s*;/,weight:4},{pattern:/=~\s*[ms]?\//,weight:3},{pattern:/\bsub\s+\w+\s*\{/,weight:2}]},yt={id:"r",extensions:[".r",".R"],aliases:["R","r"],mimeTypes:["text/x-r"],detectionPatterns:[{pattern:/\blibrary\(\w+\)/,weight:4},{pattern:/\w+\s*<-\s*/,weight:3},{pattern:/%>%/,weight:3},{pattern:/\b(data\.frame|ggplot|tibble)\s*\(/,weight:3}]},xt={id:"powershell",extensions:[".ps1",".psm1"],aliases:["PowerShell","powershell","ps1"],mimeTypes:["application/x-powershell"],detectionPatterns:[{pattern:/\b(Get|Set|New|Remove|Invoke|Start|Stop|Write|Test)-\w+/,weight:4},{pattern:/\bparam\s*\(/,weight:3},{pattern:/\[(Parameter|CmdletBinding)\b/,weight:4},{pattern:/\$\w+\s*=/,weight:1},{pattern:/\s-(eq|ne|gt|lt|match|contains)\b/,weight:2}]},St={id:"dockerfile",extensions:[".dockerfile"],aliases:["Dockerfile","docker"],mimeTypes:["text/x-dockerfile"],detectionPatterns:[{pattern:/^FROM\s+[\w./:@-]+/,weight:4},{pattern:/^(RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|EXPOSE|ENV|ARG|LABEL|USER|VOLUME)\s+/,weight:3},{pattern:/^HEALTHCHECK\b/,weight:4}]},Et={id:"dockercompose",extensions:["docker-compose.yml","docker-compose.yaml","compose.yml","compose.yaml"],aliases:["Docker Compose","docker-compose","compose"],mimeTypes:["text/x-docker-compose"],detectionPatterns:[{pattern:/^services:\s*$/,weight:5},{pattern:/^\s+(image|build|container_name|depends_on):/,weight:3},{pattern:/^\s+(ports|volumes|environment|networks|command|restart|healthcheck):/,weight:1},{pattern:/^(version|networks|volumes|configs|secrets):/,weight:1}]},kt={id:"graphql",extensions:[".graphql",".gql"],aliases:["GraphQL","graphql","gql"],mimeTypes:["application/graphql"],detectionPatterns:[{pattern:/\b(query|mutation|subscription)\s+\w*\s*[({]/,weight:4},{pattern:/\bfragment\s+\w+\s+on\s+\w+/,weight:4},{pattern:/\btype\s+\w+(\s+implements\s+\w+)?\s*\{/,weight:3},{pattern:/\(\s*\$\w+:\s*\w+!?\s*\)/,weight:3}]},Rt={id:"coffeescript",extensions:[".coffee"],aliases:["CoffeeScript","coffee","coffeescript"],mimeTypes:["text/coffeescript"],detectionPatterns:[{pattern:/^\s*\w+\s*=\s*(\([^)]*\)\s*)?->/m,weight:3},{pattern:/^\s*\w+\s*=\s*(\([^)]*\)\s*)?=>/m,weight:3},{pattern:/^\s*\w+\s*:\s*\([^)]*\)\s*->/m,weight:3},{pattern:/\bconsole\.log\s+[^(\s]/,weight:2},{pattern:/\bfor\s+(own\s+)?\w+(\s*,\s*\w+)?\s+of\s+\w+/,weight:3}]},Tt={id:"mermaid",extensions:[".mmd",".mermaid"],aliases:["Mermaid","mermaid"],mimeTypes:["text/vnd.mermaid"],detectionPatterns:[{pattern:/^\s*(graph|flowchart)\s+(TB|TD|BT|RL|LR)\b/m,weight:3},{pattern:/^\s*(sequenceDiagram|classDiagram|erDiagram|stateDiagram|gantt|pie|mindmap|timeline)\b/m,weight:3},{pattern:/^\s*\w[\w-]*\s*(-->|==>|-\.->)\s*\w/m,weight:.4},{pattern:/^\s*participant\s+\w+/m,weight:2}]},Ct={id:"jsx",extensions:[".jsx"],aliases:["React (JSX)","jsx","react"],mimeTypes:["text/jsx"],detectionPatterns:[{pattern:/<[A-Z][A-Za-z0-9]*(\s+[a-zA-Z-]+\s*=|\s*\/>)/,weight:2},{pattern:/\buse(State|Effect|Ref|Memo|Callback)\s*\(/,weight:3},{pattern:/\bReactDOM\b|\bfrom\s+["']react["']/,weight:3},{pattern:new RegExp(`(?<!\\.)\\bclassName=["'{]`),weight:1}]},Ot={id:"vue",extensions:[".vue"],aliases:["Vue","vue"],mimeTypes:["text/x-vue"],detectionPatterns:[{pattern:/^\s*<template>/m,weight:3},{pattern:/^\s*<script(\s+setup)?(\s+lang="ts")?\s*>/m,weight:2},{pattern:/^\s*<style(\s+scoped)?\s*>/m,weight:2},{pattern:/\bdefineProps\s*\(|\bdefineEmits\s*\(/,weight:3}]},_t={id:"svelte",extensions:[".svelte"],aliases:["Svelte","svelte"],mimeTypes:["text/x-svelte"],detectionPatterns:[{pattern:/\{#(if|each|await|key)\b/,weight:3},{pattern:/\$state\s*\(|\$derived\s*\(|\$effect\s*\(/,weight:3},{pattern:/\bexport\s+let\s+\w+/,weight:2},{pattern:/\bon:\w+=|bind:\w+=/,weight:2}]},Dt=[We,Ue,ze,He,Xe,Qe,Ke,Ye,Ze,et,tt,nt,st,rt,ot,it,at,lt,ct,ut,pt,dt,mt,ft,gt,ht,wt,bt,vt,yt,xt,St,Et,kt,Rt,Tt,Ct,Ot,_t];function g(e){return JSON.stringify(e).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function $t(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pt(e){return e.replace(/<\/script/gi,"<\\/script")}const At={id:"javascript",label:"JavaScript",languages:["javascript"],layout:"console",usesVendor:!1,build:({content:e})=>({body:`<script>${Pt(e)}<\/script>`})},Lt={id:"html",label:"HTML",languages:["html"],layout:"preview",usesVendor:!1,build:({content:e})=>({bare:!0,body:e.replace(/^\s*<!doctype[^>]*>/i,"")})},l={pyodide:"pyodide/pyodide.js",pyodideIndex:"pyodide/",wasmoon:"wasmoon/index.js",wasmoonGlue:"wasmoon/glue.wasm",sqlJs:"sql.js/sql-wasm.js",sqlJsDir:"sql.js/",pglite:"pglite/index.js",typescript:"typescript/typescript.js",coffeescript:"coffeescript/coffeescript.js",babel:"babel/babel.min.js",react:"react/react.production.min.js",reactDom:"react/react-dom.production.min.js",vue:"vue/vue.global.js",vueSfcLoader:"vue/vue3-sfc-loader.js",svelteCompiler:"svelte/compiler/index.js",svelteIndexClient:"svelte/src/index-client.js",svelteInternalClient:"svelte/src/internal/client/index.js",svelteDiscloseVersion:"svelte/src/internal/disclose-version.js",svelteFlagsLegacy:"svelte/src/internal/flags/legacy.js",svelteEsmEnv:"svelte/esm-env/index.js",svelteEsmEnvBrowser:"svelte/esm-env/browser-fallback.js",svelteEsmEnvDevelopment:"svelte/esm-env/dev-fallback.js",svelteEsmEnvNode:"svelte/esm-env/false.js",svelteClsx:"svelte/clsx/clsx.mjs",rubyScript:"ruby-wasm/browser.umd.js",rubyWasm:"ruby-wasm/ruby+stdlib.wasm",phpWeb:"php-wasm/PhpWeb.mjs",mermaid:"mermaid/mermaid.min.js",jscpp:"jscpp/JSCPP.es5.min.js",picoc:"picoc-js/bundle.umd.js"},qt={id:"typescript",label:"TypeScript",languages:["typescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.typescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${g(e)};
  try {
    var js = ts.transpile(CODE, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None });
    (0, eval)(js);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Nt={id:"coffeescript",label:"CoffeeScript",languages:["coffeescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.coffeescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${g(e)};
  try {
    (0, eval)(CoffeeScript.compile(CODE, { bare: true }));
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},jt={id:"mermaid",label:"Mermaid",languages:["mermaid"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.mermaid}"><\/script>`,body:`<pre class="mermaid">${$t(e)}</pre>
<script>
try {
  mermaid.initialize({ startOnLoad: true, securityLevel: "strict", theme: "default" });
} catch (e) { console.error(String(e)); }
<\/script>`})},Mt={id:"react",label:"React (Babel)",languages:["jsx","javascript"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.react}"><\/script><script src="${t}/${l.reactDom}"><\/script><script src="${t}/${l.babel}"><\/script>`,body:`<div id="root"></div>
<script>
(function () {
  var CODE = ${g(e)};
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
<\/script>`})},It={id:"python-pyodide",label:"Python (Pyodide)",languages:["python"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"Python",build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.pyodide}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${g(e)};
  console.info("Loading Python (Pyodide)…");
  // Defined before the interpreter loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "Python is still loading…"; };
  try {
    var py = await loadPyodide({ indexURL: "${t}/${l.pyodideIndex}" });
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
<\/script>`})},Bt={id:"lua-wasmoon",label:"Lua (wasmoon)",languages:["lua"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.wasmoon}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${g(e)};
  console.info("Loading Lua (wasmoon)…");
  try {
    var factory = new wasmoon.LuaFactory("${t}/${l.wasmoonGlue}");
    var lua = await factory.createEngine();
    lua.global.set("print", function () {
      console.log(Array.prototype.slice.call(arguments).map(String).join("\\t"));
    });
    await lua.doString(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Vt={id:"ruby-wasm",label:"Ruby (ruby.wasm)",languages:["ruby"],layout:"console",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.rubyScript}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${g(e)};
  console.info("Loading Ruby (ruby.wasm)…");
  try {
    // arrayBuffer + compile (not compileStreaming): independent of the
    // Content-Type the host serves .wasm with.
    var response = await fetch("${t}/${l.rubyWasm}");
    if (!response.ok) throw new Error("failed to load ruby.wasm: " + response.status);
    var module = await WebAssembly.compile(await response.arrayBuffer());
    // consolePrint defaults to true: puts/warn land in console.*, which the
    // sandbox bootstrap relays to the panel.
    var booted = await window["ruby-wasm-wasi"].DefaultRubyVM(module);
    booted.vm.eval(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Ft={id:"sql-sqljs",label:"SQLite (sql.js)",languages:["sql"],layout:"console",usesVendor:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.sqlJs}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${g(e)};
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
    var SQL = await initSqlJs({ locateFile: function (f) { return "${t}/${l.sqlJsDir}" + f; } });
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
<\/script>`})},Gt={id:"sql-pglite",label:"PostgreSQL (PGlite)",languages:["sql"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({body:`<script type="module">
const CODE = ${g(e)};
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
  const { PGlite } = await import("${t}/${l.pglite}");
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
<\/script>`})},Jt={id:"php-wasm",label:"PHP (php-wasm)",languages:["php"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({body:`<div id="php-out"></div>
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
const CODE = ${g(e)};
try {
  const { PhpWeb } = await import("${t}/${l.phpWeb}");
  const php = new PhpWeb();
  const out = document.getElementById("php-out");
  let stdout = "";
  php.addEventListener("output", function (e) { stdout += e.detail[0]; out.innerHTML = stdout; });
  php.addEventListener("error", function (e) { console.error(e.detail[0]); });
  const exitCode = await php.run(CODE);
  if (exitCode) console.warn("PHP exited with code: " + exitCode);
} catch (e) { console.error(String(e && e.message || e)); }
<\/script>`})},Wt={id:"cpp-jscpp",label:"C++ (JSCPP interpreter)",languages:["cpp"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>{const n=e.replace(/\bstd::/g,""),s=n!==e;return{head:`<script src="${t}/${l.jscpp}"><\/script>`,body:`<script>
(function () {
  var CODE = ${g(n)};
  var STRIPPED = ${s};
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
<\/script>`}}},Ut={id:"c-picoc",label:"C (PicoC interpreter)",languages:["c"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.picoc}"><\/script>`,body:`<script>
(function () {
  var CODE = ${g(e)};
  try {
    picocjs.runC(CODE, function (line) { console.log(line); });
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},zt={id:"vue-sfc",label:"Vue SFC",languages:["vue"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${l.vue}"><\/script><script src="${t}/${l.vueSfcLoader}"><\/script>`,body:`<div id="app"></div>
<script>
(function () {
  var CODE = ${g(e)};
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
<\/script>`})},Ht={id:"svelte",label:"Svelte",languages:["svelte"],layout:"preview",usesVendor:!0,scriptBlob:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script type="importmap">${g({imports:{svelte:`${t}/${l.svelteIndexClient}`,"svelte/internal/client":`${t}/${l.svelteInternalClient}`,"svelte/internal/disclose-version":`${t}/${l.svelteDiscloseVersion}`,"svelte/internal/flags/legacy":`${t}/${l.svelteFlagsLegacy}`,"esm-env":`${t}/${l.svelteEsmEnv}`,"esm-env/browser":`${t}/${l.svelteEsmEnvBrowser}`,"esm-env/development":`${t}/${l.svelteEsmEnvDevelopment}`,"esm-env/node":`${t}/${l.svelteEsmEnvNode}`,clsx:`${t}/${l.svelteClsx}`}})}<\/script><script src="${t}/${l.svelteCompiler}"><\/script>`,body:`<div id="app"></div>
<script type="module">
const CODE = ${g(e)};
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
<\/script>`})},Xt=[At,Lt,qt,Nt,jt,Mt,It,Bt,Vt,Ft,Gt,Jt,Wt,Ut,zt,Ht];function ve(e){return e?Xt.filter(t=>t.languages.includes(e)):[]}function Yn(e){return ve(e).length>0}const Qt={class:"flex-grow basis-0 overflow-auto flex flex-col text-xs font-mono min-h-0"},Kt={key:0,class:"flex-grow flex items-center justify-center text-white/50 px-4 text-center"},Yt={class:"flex items-center gap-2 px-2 py-1 border-b border-black flex-wrap"},Zt=["value"],en=["value"],tn=["value"],nn={class:"overflow-auto flex-grow min-h-0"},sn={class:"border-collapse w-full"},rn={class:"sticky top-0 bg-[#111]"},on=["onClick"],an={key:0},ln={key:0},cn=["colspan"],un={class:"flex items-center gap-2 px-2 py-1 border-t border-black"},pn=["disabled"],dn=["disabled"],mn={key:0,class:"text-white/50"},fn=be({__name:"sandbox-tables",props:{tables:{},selected:{},columns:{},rows:{},total:{},offset:{},limit:{},sortBy:{},sortDir:{},search:{},loading:{type:Boolean}},emits:["select","search","sort","page","refresh"],setup(e){return(t,n)=>(p(),d("div",Qt,[e.tables.length?(p(),d(E,{key:1},[a("div",Yt,[a("select",{value:e.selected,class:"bg-black border border-white/40 rounded-sm py-0.5",onChange:n[0]||(n[0]=s=>t.$emit("select",s.target.value))},[(p(!0),d(E,null,k(e.tables,s=>(p(),d("option",{key:s.name,value:s.name},v(s.name)+" ("+v(s.rowCount)+") ",9,en))),128))],40,Zt),a("input",{value:e.search,placeholder:"Search…",class:"bg-transparent border border-white/40 rounded-sm px-1 py-0.5 outline-none",onInput:n[1]||(n[1]=s=>t.$emit("search",s.target.value))},null,40,tn),a("button",{class:"border border-white/40 px-2 rounded-sm hover:bg-white/10",onClick:n[2]||(n[2]=s=>t.$emit("refresh"))}," Refresh ")]),a("div",nn,[a("table",sn,[a("thead",rn,[a("tr",null,[(p(!0),d(E,null,k(e.columns,s=>(p(),d("th",{key:s,class:"text-left px-2 py-1 border-b border-white/20 cursor-pointer select-none whitespace-nowrap",onClick:u=>t.$emit("sort",s)},[Y(v(s)+" ",1),e.sortBy===s?(p(),d("span",an,v(e.sortDir==="asc"?"▲":"▼"),1)):T("",!0)],8,on))),128))])]),a("tbody",null,[(p(!0),d(E,null,k(e.rows,(s,u)=>(p(),d("tr",{key:u,class:"odd:bg-white/5"},[(p(!0),d(E,null,k(s,(f,w)=>(p(),d("td",{key:w,class:"px-2 py-0.5 whitespace-nowrap max-w-64 overflow-hidden text-ellipsis"},v(f),1))),128))]))),128)),e.rows.length?T("",!0):(p(),d("tr",ln,[a("td",{colspan:e.columns.length,class:"px-2 py-2 text-white/50"},"No rows.",8,cn)]))])])]),a("div",un,[a("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset===0,onClick:n[3]||(n[3]=s=>t.$emit("page",-1))},"‹",8,pn),a("span",null,v(e.total?e.offset+1:0)+"–"+v(Math.min(e.offset+e.rows.length,e.total))+" of "+v(e.total),1),a("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset+e.limit>=e.total,onClick:n[4]||(n[4]=s=>t.$emit("page",1))},"›",8,dn),e.loading?(p(),d("span",mn,"loading…")):T("",!0)])],64)):(p(),d("div",Kt," No tables found. CREATE TABLE + INSERT something, then Run. "))]))}}),gn=Object.assign(fn,{__name:"EditorSandboxTables"});let hn="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",wn=(e=21)=>{let t="",n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=hn[n[e]&63];return t};const bn=64*1024,vn=10;function yn(e){let t=e.flags;return t.includes("g")||(t+="g"),t.includes("m")||(t+="m"),new RegExp(e.source,t)}function Zn(e){if(!e.trim())return"plaintext";const t=e.slice(0,bn),n=Dt.filter(s=>s.detectionPatterns&&s.detectionPatterns.length>0).map(s=>{const u=s.detectionPatterns.reduce((f,{pattern:w,weight:$=1})=>{const y=t.match(yn(w))?.length??0;return f+Math.min(y,vn)*$},0);return{languageId:s.id,score:u}});return n.sort((s,u)=>u.score-s.score),n.length>0&&n[0].score>0?n[0].languageId:"plaintext"}function de(e,t){let n;return function(...s){clearTimeout(n),n=setTimeout(()=>e(...s),t)}}const F="not3/sandbox/console",Z="not3/sandbox/ready",ye="not3/sandbox/eval",xe="not3/sandbox/tables/request",G="not3/sandbox/tables/result",Se="not3/sandbox/rows/request",J="not3/sandbox/rows/result",xn=["log","info","warn","error","debug","clear"],Sn=1e3,En=200,me=1e4,kn=500,Ee=200,Rn=200,Tn=new Set(["background","background-attachment","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","border","border-bottom","border-color","border-left","border-radius","border-right","border-style","border-top","border-width","box-decoration-break","box-shadow","color","cursor","display","font","font-family","font-size","font-stretch","font-style","font-variant","font-weight","letter-spacing","line-height","margin","margin-bottom","margin-left","margin-right","margin-top","opacity","outline","outline-color","outline-style","outline-width","padding","padding-bottom","padding-left","padding-right","padding-top","text-decoration","text-decoration-color","text-decoration-line","text-decoration-style","text-shadow","text-transform","vertical-align","white-space","word-break","word-spacing","word-wrap"]),Cn=/url\(|image-set\(|@import|expression\(|javascript:|[\\<>{}]/i;function On(e){if(!e||e.length>Sn)return"";const t=[];for(const n of e.split(";")){const s=n.indexOf(":");if(s===-1)continue;const u=n.slice(0,s).trim().toLowerCase(),f=n.slice(s+1).trim();!f||!Tn.has(u)||Cn.test(f)||t.push(`${u}: ${f}`)}return t.join("; ")}function _n(e){if(!(!Array.isArray(e)||e.length===0))return e.slice(0,En).map(t=>{const n=typeof t=="object"&&t!==null?t:{},s="text"in n?n.text:t;return{text:typeof s=="string"?s:String(s),css:typeof n.css=="string"?On(n.css):""}})}function ee(e){const t=typeof e=="string"?e:String(e);return t.length>me?t.slice(0,me)+"…":t}function te(e){const t=Number(e);return Number.isFinite(t)?t:null}function Dn(e){return Array.isArray(e)?e.slice(0,kn).map(t=>{const n=typeof t=="object"&&t!==null?t:{},s=Array.isArray(n.columns)?n.columns.slice(0,Ee).map(ee):[];return{name:ee(n.name),columns:s,rowCount:te(n.rowCount)??0}}):null}function $n(e){return Array.isArray(e)?e.slice(0,Rn).map(t=>Array.isArray(t)?t.slice(0,Ee).map(ee):[]):null}function Pn(e,t){if(typeof e!="object"||e===null)return null;const n=e;if(n.token!==t)return null;if(n.type===Z)return{type:Z};if(n.type===G){const u=Dn(n.tables);return u?{type:G,tables:u}:null}if(n.type===J){const u=te(n.id),f=te(n.total),w=$n(n.rows);return u===null||f===null||!w?null:{type:J,id:u,total:f,rows:w}}if(n.type!==F||!xn.includes(n.level)||!Array.isArray(n.args))return null;const s=_n(n.segments);return{type:F,level:n.level,args:n.args.map(u=>typeof u=="string"?u:String(u)),...s?{segments:s}:{}}}function An(e){return`
(function () {
  var TOKEN = ${JSON.stringify(e)};
  var CONSOLE_MSG = ${JSON.stringify(F)};
  var EVAL_MSG = ${JSON.stringify(ye)};
  var READY_MSG = ${JSON.stringify(Z)};
  var TABLES_REQ = ${JSON.stringify(xe)};
  var TABLES_RES = ${JSON.stringify(G)};
  var ROWS_REQ = ${JSON.stringify(Se)};
  var ROWS_RES = ${JSON.stringify(J)};
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
`}const Ln="allow-scripts allow-modals";function qn(e){const t=e.allowNetwork?" https:":"",n=e.vendorOrigin?` ${e.vendorOrigin}`:"",s=e.scriptBlob?" blob:":"",u=[...e.vendorOrigin?[e.vendorOrigin]:[],...e.allowNetwork?["https:","wss:"]:[]],f=["default-src 'none'",`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${s}${n}${t}`,`style-src 'unsafe-inline'${n}${t}`,`img-src data: blob:${n}${t}`,`font-src data:${n}${t}`,`media-src data: blob:${n}${t}`];return(e.vendorOrigin||e.scriptBlob)&&f.push(`worker-src blob:${n}`),f.push(`connect-src ${u.length?u.join(" "):"'none'"}`,"form-action 'none'","base-uri 'none'"),f.join("; ")}function Nn(e,t){const n=(t||"/").replace(/^\/*/,"/").replace(/\/*$/,"/");return`${e.replace(/\/$/,"")}${n}vendor`}function jn(e){const t=e.runner.build({content:e.content,vendorBase:Nn(e.origin,e.basePath)}),s=`<meta http-equiv="Content-Security-Policy" content="${qn({allowNetwork:e.allowNetwork,vendorOrigin:e.runner.usesVendor?e.origin:null,scriptBlob:e.runner.scriptBlob===!0})}"><script>${An(e.token)}<\/script>`+(t.head??"");if(t.bare)return"<!doctype html>"+s+t.body;const u=e.runner.layout==="preview"?"<style>body{background:#fff}</style>":"<style>body{background:#1e1e1e}</style>";return"<!doctype html><html><head>"+s+u+"</head><body>"+t.body+"</body></html>"}function fe(e,t,n,s){return t&&e.set(t,n),e.get(s.id)??!s.heavy}const Mn={class:"w-full h-full flex flex-col bg-[#111] text-white min-w-0 min-h-0"},In={class:"flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap"},Bn={class:"font-bold select-none"},Vn=["value"],Fn={class:"flex items-center gap-1 select-none cursor-pointer",title:"Re-run automatically when the note changes"},Gn={class:"flex items-center gap-1 select-none cursor-pointer",title:"Allow the sandbox to load resources from and connect to https:// hosts. Off by default so note code cannot send data anywhere."},Jn=["srcdoc","sandbox"],Wn={key:0,class:"flex items-center gap-1 px-2 py-1 bg-black/60 text-xs"},Un=["onClick"],zn=["placeholder"],ge=500,K=50,Hn=700,Xn=15,Qn=be({__name:"sandbox-panel",props:{content:{},languageId:{},popout:{type:Boolean},resizing:{type:Boolean}},emits:["close","popout"],setup(e,{emit:t}){const n=e,s=t,u={log:"text-gray-100",info:"text-blue-300",warn:"text-yellow-400",error:"text-red-400",debug:"text-gray-500",input:"text-green-400"},{uiBaseURL:f}=qe().public,w=b(),$=b(),y=b([]),P=b(""),x=b(!0),A=b(!1),U=b("");let j="";const ne=new Map,R=b(""),C=Q(()=>ve(n.languageId)),h=Q(()=>C.value.find(r=>r.id===R.value)??C.value[0]??null),O=b("console"),_=b([]),S=b(""),i=b({rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1});let se=0,M=null,re=0;const ke=Q(()=>_.value.find(r=>r.name===S.value)?.columns??[]);function z(r){w.value?.contentWindow?.postMessage({...r,token:j},"*")}function I(){M&&clearTimeout(M),M=null}function H(){if(!h.value?.tables)return;I(),re=0;const r=()=>{z({type:xe}),++re<Xn&&(M=setTimeout(r,Hn))};r()}function L(){S.value&&(i.value.loading=!0,z({type:Se,query:{id:++se,table:S.value,offset:i.value.offset,limit:K,sortBy:i.value.sortBy??void 0,sortDir:i.value.sortDir,search:i.value.search||void 0}}))}function oe(){I(),_.value=[],S.value="",i.value={rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1}}function Re(r){O.value=r,r==="tables"&&H()}function Te(r){S.value=r,i.value.offset=0,i.value.sortBy=null,i.value.sortDir="asc",i.value.search="",L()}const Ce=de(L,300);function Oe(r){i.value.search=r,i.value.offset=0,Ce()}function _e(r){i.value.sortBy===r?i.value.sortDir=i.value.sortDir==="asc"?"desc":"asc":(i.value.sortBy=r,i.value.sortDir="asc"),L()}function De(r){i.value.offset=Math.max(0,i.value.offset+r*K),L()}function $e(r){return r.segments??[{text:r.text,css:""}]}function ie(r){y.value.push(r),y.value.length>ge&&y.value.splice(0,y.value.length-ge),Fe(()=>$.value?.scrollTo({top:$.value.scrollHeight}))}function q(){h.value&&(y.value=[],oe(),j=wn(),U.value=jn({runner:h.value,content:n.content,token:j,allowNetwork:A.value,origin:window.location.origin,basePath:f}),h.value.tables&&H())}function ae(r){if(!w.value||r.source!==w.value.contentWindow)return;const o=Pn(r.data,j);if(o){if(o.type===G){I(),_.value=o.tables,_.value.some(X=>X.name===S.value)||(S.value=_.value[0]?.name??"",i.value.offset=0),S.value&&L();return}if(o.type===J){if(o.id!==se)return;i.value.rows=o.rows,i.value.total=o.total,i.value.loading=!1;return}o.type===F&&(o.level==="clear"?y.value=[]:ie({level:o.level,text:o.args.join(" "),segments:o.segments}))}}function Pe(){const r=P.value.trim();!r||!w.value?.contentWindow||(ie({level:"input",text:"> "+r}),O.value="console",z({type:ye,code:r}),P.value="")}const Ae=de(()=>{x.value&&q()},1e3);return B(()=>n.content,()=>Ae()),B(A,q),B(C,r=>{r.some(o=>o.id===R.value)||(R.value=r[0]?.id??"")}),B(h,(r,o)=>{if(!r){s("close");return}r.id!==o?.id&&(x.value=fe(ne,o?.id??null,x.value,r),r.tables||(O.value="console"),x.value?q():(y.value=[],oe(),U.value=""))}),Ne(()=>{window.addEventListener("message",ae),R.value=C.value[0]?.id??"",x.value=h.value?fe(ne,null,x.value,h.value):!0,q()}),je(()=>{window.removeEventListener("message",ae),I()}),(r,o)=>{const X=gn;return p(),d("div",Mn,[a("div",In,[a("span",Bn,v(c(h)?.label||"Sandbox"),1),c(C).length>1?D((p(),d("select",{key:0,"onUpdate:modelValue":o[0]||(o[0]=m=>V(R)?R.value=m:null),class:"bg-black border border-white/40 rounded-sm text-xs py-0.5",title:"Execution engine for this language"},[(p(!0),d(E,null,k(c(C),m=>(p(),d("option",{key:m.id,value:m.id},v(m.label),9,Vn))),128))],512)),[[Me,c(R)]]):T("",!0),a("button",{class:"sandbox-btn",onClick:q},"Run"),a("button",{class:"sandbox-btn",onClick:o[1]||(o[1]=m=>y.value=[])},"Clear"),a("label",Fn,[D(a("input",{"onUpdate:modelValue":o[2]||(o[2]=m=>V(x)?x.value=m:null),type:"checkbox"},null,512),[[ue,c(x)]]),o[7]||(o[7]=Y(" auto ",-1))]),a("label",Gn,[D(a("input",{"onUpdate:modelValue":o[3]||(o[3]=m=>V(A)?A.value=m:null),type:"checkbox"},null,512),[[ue,c(A)]]),o[8]||(o[8]=Y(" network ",-1))]),o[9]||(o[9]=a("div",{class:"flex-grow"},null,-1)),e.popout?T("",!0):(p(),d("button",{key:1,class:"sandbox-btn",title:"Move this panel into a separate window",onClick:o[4]||(o[4]=m=>r.$emit("popout"))},"Popout")),a("button",{class:N(e.popout?"sandbox-btn":"sandbox-btn sm:hidden"),onClick:o[5]||(o[5]=m=>r.$emit("close"))},"Close",2)]),a("iframe",{ref_key:"iframe",ref:w,srcdoc:c(U),sandbox:c(Ln),referrerpolicy:"no-referrer",class:N([c(h)?.layout==="preview"?"w-full flex-grow bg-white border-none":"hidden",e.resizing?"pointer-events-none":""])},null,10,Jn),c(h)?.tables?(p(),d("div",Wn,[(p(),d(E,null,k(["console","tables"],m=>a("button",{key:m,class:N(["px-2 rounded-sm border border-white/40 capitalize",c(O)===m?"bg-white/20":"hover:bg-white/10"]),onClick:le=>Re(m)},v(m),11,Un)),64))])):T("",!0),c(h)?.tables?D((p(),Ie(X,{key:1,tables:c(_),selected:c(S),columns:c(ke),rows:c(i).rows,total:c(i).total,offset:c(i).offset,limit:K,"sort-by":c(i).sortBy,"sort-dir":c(i).sortDir,search:c(i).search,loading:c(i).loading,onSelect:Te,onSearch:Oe,onSort:_e,onPage:De,onRefresh:H},null,8,["tables","selected","columns","rows","total","offset","sort-by","sort-dir","search","loading"])),[[pe,c(O)==="tables"]]):T("",!0),D(a("div",{ref_key:"output",ref:$,class:N(["overflow-y-auto font-mono text-xs px-2 py-1",c(h)?.layout==="preview"?"h-48 border-t border-black flex-shrink-0":"flex-grow basis-0"])},[(p(!0),d(E,null,k(c(y),(m,le)=>(p(),d("div",{key:le,class:N(["whitespace-pre-wrap break-all",u[m.level]])},[(p(!0),d(E,null,k($e(m),(ce,Le)=>(p(),d("span",{key:Le,style:Ge(ce.css)},v(ce.text),5))),128))],2))),128))],2),[[pe,c(O)==="console"]]),a("form",{class:"flex items-center border-t border-black",onSubmit:Ve(Pe,["prevent"])},[o[10]||(o[10]=a("span",{class:"pl-2 pr-1 py-1 text-green-400 font-mono text-xs select-none"},">",-1)),D(a("input",{"onUpdate:modelValue":o[6]||(o[6]=m=>V(P)?P.value=m:null),class:"flex-grow bg-transparent font-mono text-xs py-1 pr-2 outline-none",placeholder:`Run ${c(h)?.replLanguage??"JavaScript"} in the sandbox…`},null,8,zn),[[Be,c(P)]])],32)])}}}),es=Object.assign(Je(Qn,[["__scopeId","data-v-9fd0bbb4"]]),{__name:"EditorSandboxPanel"}),he="not3/popout/ready",we="not3/popout/state";function ts(e){if(typeof e!="object"||e===null)return null;const t=e;return t.type===he?{type:he}:t.type!==we||typeof t.content!="string"||typeof t.languageId!="string"?null:{type:we,content:t.content,languageId:t.languageId}}let W=null;function ns(e){W=e}function ss(){return W}function rs(){try{W?.close()}catch{}W=null}const os=globalThis.setInterval;export{he as P,es as _,we as a,ns as b,rs as c,de as d,Zn as e,ss as g,Yn as i,Dt as l,ts as p,os as s};
