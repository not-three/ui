import{d as Te,g as v,F as O,i as h,E as A,j as D,t as _,o as w,K as ne,p as Ge,w as F,e as ze,f as We,a as g,q as N,G as Je,x as J,M as me,k as G,N as fe,c as He,O as Z,v as Ue,s as ge,r as C,y as ee,B as Xe,n as Ke,_ as Qe}from"./D6qjwVW1.js";const Ye={id:"typescript",extensions:[".ts",".tsx"],aliases:["TypeScript","ts","typescript"],mimeTypes:["application/typescript"],detectionPatterns:[{pattern:/^[\s\n]*(import|export)\s+.*from\s+['"]/,weight:2},{pattern:/^[\s\n]*(interface|type|class)\s+\w+/,weight:2},{pattern:/:\s*(string|number|boolean|any)\b/,weight:1},{pattern:/\basync\s+function\b/,weight:1}]},Ze={id:"javascript",extensions:[".js",".jsx",".mjs",".cjs"],aliases:["JavaScript","js","javascript"],mimeTypes:["application/javascript"],detectionPatterns:[{pattern:/^[\s\n]*(import|export)\s+.*from\s+['"]/,weight:1},{pattern:/^[\s\n]*const\s+\w+\s*=\s*require\(/,weight:2},{pattern:/\bfunction\s*\*?\s*\w+\s*\(/,weight:2},{pattern:/\bclass\s+\w+(\s+extends\s+\w+)?/,weight:1},{pattern:/\bconsole\.(log|error|warn|info|debug)\s*\(/,weight:2},{pattern:/\b(document|window)\.\w+/,weight:2},{pattern:/\b(const|let)\s+\w+\s*[=;]/,weight:1},{pattern:/\([^()]*\)\s*=>|\b\w+\s*=>/,weight:1},{pattern:/`[^`]*\$\{[^}]*\}[^`]*`/,weight:2},{pattern:/===|!==/,weight:1}]},et={id:"json",extensions:[".json",".jsonc"],aliases:["JSON","json"],mimeTypes:["application/json"],detectionPatterns:[{pattern:/^[\s\n]*(\{|\[)[\s\n]*"/,weight:2},{pattern:/^[\s\n]*\{[\s\n]*"[^"]+"\s*:/,weight:2}]},tt={id:"csv",extensions:[".csv",".tsv"],aliases:["CSV","TSV","csv","tsv"],mimeTypes:["text/csv","text/tab-separated-values"]},nt={id:"yaml",extensions:[".yml",".yaml"],aliases:["YAML","yaml"],mimeTypes:["text/x-yaml"],detectionPatterns:[{pattern:/^[\s\n]*---/,weight:2},{pattern:/^[\s\n]*[\w-]+:\s*[|[{]?/,weight:1},{pattern:/^[\s\n]*-\s+\w+:\s/,weight:1}]},st={id:"cpp",extensions:[".cpp",".cc",".cxx",".hpp",".hh",".hxx"],aliases:["C++","cpp"],mimeTypes:["text/x-c++src"],detectionPatterns:[{pattern:/^\s*#include\s+<.*>/,weight:2},{pattern:/^\s*(class|struct)\s+\w+/,weight:2},{pattern:/^\s*template\s*<.*>/,weight:1}]},rt={id:"go",extensions:[".go"],aliases:["Go","go"],mimeTypes:["text/x-go"],detectionPatterns:[{pattern:/^\s*package\s+\w+/,weight:2},{pattern:/^\s*func\s+(\w+\s*)?\(/,weight:2},{pattern:/^\s*import\s+/,weight:1}]},ot={id:"c",extensions:[".c",".h"],aliases:["C","c"],mimeTypes:["text/x-csrc"],detectionPatterns:[{pattern:/^\s*#include\s+<.*>/,weight:2},{pattern:/^\s*(int|void|char)\s+\w+\s*\(/,weight:2},{pattern:/^\s*#define\s+\w+/,weight:1}]},at={id:"java",extensions:[".java"],aliases:["Java","java"],mimeTypes:["text/x-java-source"],detectionPatterns:[{pattern:/^\s*package\s+\w+(\.\w+)*;/,weight:2},{pattern:/^\s*public\s+(class|interface)\s+\w+/,weight:2},{pattern:/^\s*import\s+/,weight:1}]},it={id:"toml",extensions:[".toml"],aliases:["TOML","toml"],mimeTypes:["text/x-toml"],configuration:{comments:{lineComment:"#"},brackets:[["[","]"],["{","}"]],autoClosingPairs:[{open:'"',close:'"'},{open:"'",close:"'"},{open:"[",close:"]"},{open:"{",close:"}"}],surroundingPairs:[{open:'"',close:'"'},{open:"'",close:"'"},{open:"[",close:"]"},{open:"{",close:"}"}]},tokenizer:{defaultToken:"",tokenPostfix:".toml",keywords:["true","false"],tokenizer:{root:[[/#.*$/,"comment"],[/\s+/,""],[/^\s*\[\[.*?\]\]/,"metatag"],[/^\s*\[.*?\]/,"metatag"],[/([A-Za-z_][A-Za-z0-9_-]*)(\s*=\s*)/,["key","delimiter"]],[/"/,{token:"string.quote",next:"@string_double"}],[/'/,{token:"string.quote",next:"@string_single"}],[/-?\d+(\.\d+)?([eE][-+]?\d+)?/,"number"],[/\b(true|false)\b/,"keyword"],[/\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?/,"string.date"]],string_double:[[/[^\\"]+/,"string"],[/\\./,"string.escape"],[/"/,{token:"string.quote",next:"@pop"}],[/./,"string"]],string_single:[[/[^\\']+/,"string"],[/\\./,"string.escape"],[/'/,{token:"string.quote",next:"@pop"}],[/./,"string"]]}},detectionPatterns:[{pattern:/^\s*\[.*\]/,weight:2},{pattern:/^\s*\w+\s*=\s*.+$/,weight:1}]},lt={id:"ini",extensions:[".ini",".cfg",".conf"],aliases:["INI","ini"],mimeTypes:["text/x-ini"],detectionPatterns:[{pattern:/^\s*\[.*\]/,weight:2},{pattern:/^\s*\w+\s*=\s*.*$/,weight:1}]},ct={id:"markdown",extensions:[".md",".markdown"],aliases:["Markdown","markdown"],mimeTypes:["text/markdown"],detectionPatterns:[{pattern:/^#{1,6}\s+/,weight:2},{pattern:/^\s*>/,weight:1},{pattern:/^\s*[-*+]\s+/,weight:1}]},ut={id:"python",extensions:[".py",".pyw"],aliases:["Python","python"],mimeTypes:["text/x-python"],detectionPatterns:[{pattern:/^\s*def\s+\w+\s*\(/,weight:2},{pattern:/^\s*class\s+\w+\s*:/,weight:2},{pattern:/^\s*import\s+\w+/,weight:1}]},pt={id:"php",extensions:[".php",".phtml",".php3",".php4",".php5",".php7",".php8"],aliases:["PHP","php"],mimeTypes:["application/x-php"],detectionPatterns:[{pattern:/^<\?php/,weight:2},{pattern:/<\?=.*\?>/,weight:1}]},dt={id:"shell",extensions:[".sh",".bash",".ksh",".zsh"],aliases:["Sh","sh"],mimeTypes:["application/x-sh"],detectionPatterns:[{pattern:/^#!\/bin\/sh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+sh/,weight:2},{pattern:/^#!\/bin\/bash/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+bash/,weight:2},{pattern:/^#!\/bin\/ksh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+ksh/,weight:2},{pattern:/^#!\/bin\/zsh/,weight:2},{pattern:/^#!\/usr\/bin\/env\s+zsh/,weight:2},{pattern:/^\s*case\s+\w+\s+in/,weight:1},{pattern:/^\s*if\s+\[/,weight:1},{pattern:/^\s*#!/,weight:1}]},mt={id:"html",extensions:[".html",".htm",".xhtml"],aliases:["HTML","html"],mimeTypes:["text/html"],detectionPatterns:[{pattern:/<\s*!DOCTYPE\s+html\s*>/i,weight:2},{pattern:/<\s*html\s*.*?>/i,weight:2},{pattern:/<\s*head\s*.*?>/i,weight:1},{pattern:/<\s*body\s*.*?>/i,weight:1},{pattern:/<\s*script\s*.*?>[\s\S]*?<\/\s*script\s*>/i,weight:2},{pattern:/<\s*link\s+.*?rel\s*=\s*["']stylesheet["'].*?>/i,weight:1},{pattern:/<\s*meta\s+.*?charset\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*div\s+.*?>/i,weight:1},{pattern:/<\s*input\s+.*?type\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*img\s+.*?src\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*a\s+.*?href\s*=\s*["'][^"']*["'].*?>/i,weight:1},{pattern:/<\s*(h[1-6]|p|span|ul|ol|li|table|tr|td|th|button|section)\s+[a-zA-Z-]+\s*=/i,weight:1},{pattern:/<\s*(h[1-6]|p|span|li|button|td|th)\b[^>]*>[^<]+<\/\s*\1\s*>/i,weight:1}]},ft={id:"xml",extensions:[".xml",".xsd",".xsl",".xslt",".svg"],aliases:["XML","xml"],mimeTypes:["application/xml","text/xml","application/atom+xml","application/rss+xml"],detectionPatterns:[{pattern:/<\?xml\s+version\s*=\s*["'][^"']*["']\s*.*?\?>/i,weight:5},{pattern:/\bxmlns(:[\w.-]+)?\s*=\s*["'][^"']*["']/i,weight:3},{pattern:/<\/?[a-zA-Z][\w.-]*:[a-zA-Z][\w.-]*[\s/>]/,weight:3},{pattern:/<!\[CDATA\[[\s\S]*?\]\]>/i,weight:3},{pattern:/<\?(?!xml\b)[a-zA-Z][\w-]*(\s[^?]*)?\?>/i,weight:2},{pattern:/<!DOCTYPE\s+\w+\s+(SYSTEM|PUBLIC)\b[^>]*>/i,weight:2},{pattern:/<\s*comment\s*.*?>[\s\S]*?<\/\s*comment\s*>/i,weight:1},{pattern:/<\s*\/?\s*\w+[^>]*>/,weight:.05}]},gt={id:"sql",extensions:[".sql"],aliases:["SQL","sql"],mimeTypes:["application/sql","text/sql"],detectionPatterns:[{pattern:/SELECT\s+.*?\s+FROM\s+/i,weight:2},{pattern:/INSERT\s+INTO\s+.*?\s+VALUES\s+/i,weight:2},{pattern:/UPDATE\s+.*?\s+SET\s+/i,weight:2},{pattern:/DELETE\s+FROM\s+/i,weight:2},{pattern:/CREATE\s+(TABLE|DATABASE|INDEX)\s+/i,weight:1},{pattern:/DROP\s+(TABLE|DATABASE|INDEX)\s+/i,weight:1},{pattern:/ALTER\s+TABLE\s+/i,weight:1},{pattern:/\bWHERE\b/i,weight:1}]},ht={id:"plaintext",extensions:[".txt"],aliases:["Plaintext","text","plain"],mimeTypes:["text/plain"],detectionPatterns:[]},wt={id:"css",extensions:[".css"],aliases:["CSS","css"],mimeTypes:["text/css"],detectionPatterns:[{pattern:/[.#][\w-]+\s*\{/,weight:2},{pattern:/^\s*[\w-]+\s*:\s*[^;{}]+;\s*$/,weight:1},{pattern:/@(media|import|keyframes|font-face|charset)\b/,weight:3},{pattern:/:(hover|focus|active|first-child|nth-child|last-child)\b/,weight:2},{pattern:/!important\b/,weight:2}]},bt={id:"scss",extensions:[".scss"],aliases:["SCSS","scss"],mimeTypes:["text/x-scss"],detectionPatterns:[{pattern:/\$[\w-]+\s*:\s*[^;]+;/,weight:3},{pattern:/@(mixin|include|extend|use|forward|each|if|else)\b/,weight:3},{pattern:/&[.:#[]/,weight:2},{pattern:/[.#][\w-]+\s*\{/,weight:1}]},vt={id:"less",extensions:[".less"],aliases:["Less","less"],mimeTypes:["text/x-less"],detectionPatterns:[{pattern:/@[\w-]+\s*:\s*[^;]+;/,weight:3},{pattern:/&:extend\(/,weight:4},{pattern:/\.[\w-]+\s*\([^)]*\)\s*;/,weight:2},{pattern:/[.#][\w-]+\s*\{/,weight:1}]},yt={id:"rust",extensions:[".rs"],aliases:["Rust","rust"],mimeTypes:["text/x-rust"],detectionPatterns:[{pattern:/\bfn\s+\w+\s*(<[^>]*>)?\s*\(/,weight:2},{pattern:/\blet\s+mut\s+\w+/,weight:3},{pattern:/\buse\s+\w+(::\w+)+/,weight:3},{pattern:/\b(impl|trait|struct|enum)\s+\w+/,weight:2},{pattern:/\b(println|panic|vec|format)!\s*\(/,weight:3},{pattern:/->\s*&?\w+/,weight:1}]},xt={id:"ruby",extensions:[".rb",".erb"],aliases:["Ruby","ruby","rb"],mimeTypes:["text/x-ruby"],detectionPatterns:[{pattern:/^\s*def\s+\w+/,weight:2},{pattern:/^\s*end\s*$/,weight:2},{pattern:/\brequire(_relative)?\s+['"]/,weight:3},{pattern:/\bputs\s+/,weight:2},{pattern:/\bdo\s*\|[\w\s,]+\|/,weight:3},{pattern:/\battr_(accessor|reader|writer)\b/,weight:4}]},St={id:"csharp",extensions:[".cs"],aliases:["C#","csharp","cs"],mimeTypes:["text/x-csharp"],detectionPatterns:[{pattern:/\busing\s+System(\.\w+)*\s*;/,weight:4},{pattern:/\bnamespace\s+[\w.]+/,weight:2},{pattern:/\b(public|private|internal|protected)\s+(static\s+)?(class|void|int|string|async)\b/,weight:2},{pattern:/Console\.Write(Line)?\(/,weight:3},{pattern:/\bvar\s+\w+\s*=\s*new\s+\w+/,weight:2}]},kt={id:"kotlin",extensions:[".kt",".kts"],aliases:["Kotlin","kotlin","kt"],mimeTypes:["text/x-kotlin"],detectionPatterns:[{pattern:/\bfun\s+\w+\s*\(/,weight:3},{pattern:/\bdata\s+class\s+\w+/,weight:4},{pattern:/\bcompanion\s+object\b/,weight:4},{pattern:/\b(val|var)\s+\w+\s*:\s*\w+/,weight:2},{pattern:/\bwhen\s*\(/,weight:2}]},Et={id:"swift",extensions:[".swift"],aliases:["Swift","swift"],mimeTypes:["text/x-swift"],detectionPatterns:[{pattern:/\bimport\s+(Foundation|UIKit|SwiftUI|Combine)\b/,weight:4},{pattern:/\bfunc\s+\w+\s*\(/,weight:2},{pattern:/\bguard\s+let\b/,weight:4},{pattern:/@(State|Published|ObservedObject|IBOutlet|IBAction|main)\b/,weight:3},{pattern:/\b(var|let)\s+\w+\s*:\s*\[?\w+\]?[?!]/,weight:2}]},Tt={id:"dart",extensions:[".dart"],aliases:["Dart","dart"],mimeTypes:["application/dart"],detectionPatterns:[{pattern:/\bimport\s+'package:/,weight:4},{pattern:/\bvoid\s+main\s*\(\s*\)/,weight:2},{pattern:/\bWidget\s+build\s*\(/,weight:4},{pattern:/\bfinal\s+\w+(<[^>]+>)?\s+\w+\s*=/,weight:2},{pattern:/\b(StatelessWidget|StatefulWidget|BuildContext)\b/,weight:4}]},Rt={id:"lua",extensions:[".lua"],aliases:["Lua","lua"],mimeTypes:["text/x-lua"],detectionPatterns:[{pattern:/\blocal\s+\w+\s*=/,weight:3},{pattern:/\bfunction\s+\w+[.:]?\w*\s*\([^)]*\)\s*$/,weight:2},{pattern:/\b(elseif|then)\b/,weight:2},{pattern:/\bnil\b/,weight:1},{pattern:/\bpairs\s*\(|\bipairs\s*\(/,weight:3}]},Ct={id:"perl",extensions:[".pl",".pm"],aliases:["Perl","perl"],mimeTypes:["text/x-perl"],detectionPatterns:[{pattern:/\bmy\s+[$@%]\w+/,weight:4},{pattern:/^\s*use\s+(strict|warnings)\s*;/,weight:4},{pattern:/=~\s*[ms]?\//,weight:3},{pattern:/\bsub\s+\w+\s*\{/,weight:2}]},_t={id:"r",extensions:[".r",".R"],aliases:["R","r"],mimeTypes:["text/x-r"],detectionPatterns:[{pattern:/\blibrary\(\w+\)/,weight:4},{pattern:/\w+\s*<-\s*/,weight:3},{pattern:/%>%/,weight:3},{pattern:/\b(data\.frame|ggplot|tibble)\s*\(/,weight:3}]},$t={id:"powershell",extensions:[".ps1",".psm1"],aliases:["PowerShell","powershell","ps1"],mimeTypes:["application/x-powershell"],detectionPatterns:[{pattern:/\b(Get|Set|New|Remove|Invoke|Start|Stop|Write|Test)-\w+/,weight:4},{pattern:/\bparam\s*\(/,weight:3},{pattern:/\[(Parameter|CmdletBinding)\b/,weight:4},{pattern:/\$\w+\s*=/,weight:1},{pattern:/\s-(eq|ne|gt|lt|match|contains)\b/,weight:2}]},Ot={id:"dockerfile",extensions:[".dockerfile"],aliases:["Dockerfile","docker"],mimeTypes:["text/x-dockerfile"],detectionPatterns:[{pattern:/^FROM\s+[\w./:@-]+/,weight:4},{pattern:/^(RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|EXPOSE|ENV|ARG|LABEL|USER|VOLUME)\s+/,weight:3},{pattern:/^HEALTHCHECK\b/,weight:4}]},Dt={id:"dockercompose",extensions:["docker-compose.yml","docker-compose.yaml","compose.yml","compose.yaml"],aliases:["Docker Compose","docker-compose","compose"],mimeTypes:["text/x-docker-compose"],detectionPatterns:[{pattern:/^services:\s*$/,weight:5},{pattern:/^\s+(image|build|container_name|depends_on):/,weight:3},{pattern:/^\s+(ports|volumes|environment|networks|command|restart|healthcheck):/,weight:1},{pattern:/^(version|networks|volumes|configs|secrets):/,weight:1}]},At={id:"graphql",extensions:[".graphql",".gql"],aliases:["GraphQL","graphql","gql"],mimeTypes:["application/graphql"],detectionPatterns:[{pattern:/\b(query|mutation|subscription)\s+\w*\s*[({]/,weight:4},{pattern:/\bfragment\s+\w+\s+on\s+\w+/,weight:4},{pattern:/\btype\s+\w+(\s+implements\s+\w+)?\s*\{/,weight:3},{pattern:/\(\s*\$\w+:\s*\w+!?\s*\)/,weight:3}]},Pt={id:"coffeescript",extensions:[".coffee"],aliases:["CoffeeScript","coffee","coffeescript"],mimeTypes:["text/coffeescript"],detectionPatterns:[{pattern:/^\s*\w+\s*=\s*(\([^)]*\)\s*)?->/m,weight:3},{pattern:/^\s*\w+\s*=\s*(\([^)]*\)\s*)?=>/m,weight:3},{pattern:/^\s*\w+\s*:\s*\([^)]*\)\s*->/m,weight:3},{pattern:/\bconsole\.log\s+[^(\s]/,weight:2},{pattern:/\bfor\s+(own\s+)?\w+(\s*,\s*\w+)?\s+of\s+\w+/,weight:3}]},Lt={id:"mermaid",extensions:[".mmd",".mermaid"],aliases:["Mermaid","mermaid"],mimeTypes:["text/vnd.mermaid"],detectionPatterns:[{pattern:/^\s*(graph|flowchart)\s+(TB|TD|BT|RL|LR)\b/m,weight:3},{pattern:/^\s*(sequenceDiagram|classDiagram|erDiagram|stateDiagram|gantt|pie|mindmap|timeline)\b/m,weight:3},{pattern:/^\s*\w[\w-]*\s*(-->|==>|-\.->)\s*\w/m,weight:.4},{pattern:/^\s*participant\s+\w+/m,weight:2}]},jt={id:"jsx",extensions:[".jsx"],aliases:["React (JSX)","jsx","react"],mimeTypes:["text/jsx"],detectionPatterns:[{pattern:/<[A-Z][A-Za-z0-9]*(\s+[a-zA-Z-]+\s*=|\s*\/>)/,weight:2},{pattern:/\buse(State|Effect|Ref|Memo|Callback)\s*\(/,weight:3},{pattern:/\bReactDOM\b|\bfrom\s+["']react["']/,weight:3},{pattern:new RegExp(`(?<!\\.)\\bclassName=["'{]`),weight:1}]},qt={id:"vue",extensions:[".vue"],aliases:["Vue","vue"],mimeTypes:["text/x-vue"],detectionPatterns:[{pattern:/^\s*<template>/m,weight:3},{pattern:/^\s*<script(\s+setup)?(\s+lang="ts")?\s*>/im,weight:2},{pattern:/^\s*<style(\s+scoped)?\s*>/m,weight:2},{pattern:/\bdefineProps\s*\(|\bdefineEmits\s*\(/,weight:3}]},Nt={id:"svelte",extensions:[".svelte"],aliases:["Svelte","svelte"],mimeTypes:["text/x-svelte"],detectionPatterns:[{pattern:/\{#(if|each|await|key)\b/,weight:3},{pattern:/\$state\s*\(|\$derived\s*\(|\$effect\s*\(/,weight:3},{pattern:/\bexport\s+let\s+\w+/,weight:2},{pattern:/\bon:\w+=|bind:\w+=/,weight:2}]},Mt=[Ye,Ze,et,tt,nt,st,rt,ot,at,it,lt,ct,ut,pt,dt,mt,ft,gt,ht,wt,bt,vt,yt,xt,St,kt,Et,Tt,Rt,Ct,_t,$t,Ot,Dt,At,Pt,Lt,jt,qt,Nt];function k(e){return JSON.stringify(e).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function It(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Bt(e){return e.replace(/<\/script/gi,"<\\/script")}const Vt={id:"javascript",label:"JavaScript",languages:["javascript"],layout:"console",usesVendor:!1,build:({content:e})=>({body:`<script>${Bt(e)}<\/script>`})},Ft={id:"html",label:"HTML",languages:["html"],layout:"preview",usesVendor:!1,build:({content:e})=>({bare:!0,body:e.replace(/^\s*<!doctype[^>]*>/i,"")})},d={markdown:"markdown/markdown.min.js",papaParse:"papaparse/papaparse.min.js",pyodide:"pyodide/pyodide.js",pyodideIndex:"pyodide/",wasmoon:"wasmoon/index.js",wasmoonGlue:"wasmoon/glue.wasm",sqlJs:"sql.js/sql-wasm.js",sqlJsDir:"sql.js/",pglite:"pglite/index.js",typescript:"typescript/typescript.js",coffeescript:"coffeescript/coffeescript.js",babel:"babel/babel.min.js",react:"react/react.production.min.js",reactDom:"react/react-dom.production.min.js",vue:"vue/vue.global.js",vueSfcLoader:"vue/vue3-sfc-loader.js",svelteCompiler:"svelte/compiler/index.js",svelteIndexClient:"svelte/src/index-client.js",svelteInternalClient:"svelte/src/internal/client/index.js",svelteDiscloseVersion:"svelte/src/internal/disclose-version.js",svelteFlagsLegacy:"svelte/src/internal/flags/legacy.js",svelteEsmEnv:"svelte/esm-env/index.js",svelteEsmEnvBrowser:"svelte/esm-env/browser-fallback.js",svelteEsmEnvDevelopment:"svelte/esm-env/dev-fallback.js",svelteEsmEnvNode:"svelte/esm-env/false.js",svelteClsx:"svelte/clsx/clsx.mjs",rubyScript:"ruby-wasm/browser.umd.js",rubyWasm:"ruby-wasm/ruby+stdlib.wasm",phpWeb:"php-wasm/PhpWeb.mjs",mermaid:"mermaid/mermaid.min.js",jscpp:"jscpp/JSCPP.es5.min.js",picoc:"picoc-js/bundle.umd.js"},Gt={id:"typescript",label:"TypeScript",languages:["typescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.typescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    var js = ts.transpile(CODE, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None });
    (0, eval)(js);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},zt={id:"coffeescript",label:"CoffeeScript",languages:["coffeescript"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.coffeescript}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    (0, eval)(CoffeeScript.compile(CODE, { bare: true }));
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Wt={id:"mermaid",label:"Mermaid",languages:["mermaid"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.mermaid}"><\/script>`,body:`<pre class="mermaid">${It(e)}</pre>
<script>
try {
  mermaid.initialize({ startOnLoad: true, securityLevel: "strict", theme: "default" });
} catch (e) { console.error(String(e)); }
<\/script>`})},Jt=`<style>
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
</style>`,Ht={id:"markdown-preview",label:"Markdown preview",languages:["markdown"],layout:"preview",usesVendor:!0,noRepl:!0,defaultTab:"console",build:({content:e,vendorBase:t,theme:n})=>({head:`${Jt}<script src="${t}/${d.markdown}"><\/script><script src="${t}/${d.mermaid}"><\/script>`,body:`<main class="markdown-preview" data-theme="${n}"></main>
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
<\/script>`})},Ut={id:"react",label:"React (Babel)",languages:["jsx","javascript"],layout:"preview",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.react}"><\/script><script src="${t}/${d.reactDom}"><\/script><script src="${t}/${d.babel}"><\/script>`,body:`<div id="root"></div>
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
<\/script>`})},Xt={id:"python-pyodide",label:"Python (Pyodide)",languages:["python"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"Python",build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.pyodide}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Python (Pyodide)…");
  // Defined before the interpreter loads so REPL input during startup gets a
  // clear answer instead of falling back to JS eval.
  window.__not3Eval__ = function () { return "Python is still loading…"; };
  try {
    var py = await loadPyodide({ indexURL: "${t}/${d.pyodideIndex}" });
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
<\/script>`})},Kt={id:"lua-wasmoon",label:"Lua (wasmoon)",languages:["lua"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.wasmoon}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Lua (wasmoon)…");
  try {
    var factory = new wasmoon.LuaFactory("${t}/${d.wasmoonGlue}");
    var lua = await factory.createEngine();
    lua.global.set("print", function () {
      console.log(Array.prototype.slice.call(arguments).map(String).join("\\t"));
    });
    await lua.doString(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Qt={id:"ruby-wasm",label:"Ruby (ruby.wasm)",languages:["ruby"],layout:"console",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.rubyScript}"><\/script>`,body:`<script>
(async function () {
  var CODE = ${k(e)};
  console.info("Loading Ruby (ruby.wasm)…");
  try {
    // arrayBuffer + compile (not compileStreaming): independent of the
    // Content-Type the host serves .wasm with.
    var response = await fetch("${t}/${d.rubyWasm}");
    if (!response.ok) throw new Error("failed to load ruby.wasm: " + response.status);
    var module = await WebAssembly.compile(await response.arrayBuffer());
    // consolePrint defaults to true: puts/warn land in console.*, which the
    // sandbox bootstrap relays to the panel.
    var booted = await window["ruby-wasm-wasi"].DefaultRubyVM(module);
    booted.vm.eval(CODE);
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},Yt={id:"sql-sqljs",label:"SQLite (sql.js)",languages:["sql"],layout:"console",usesVendor:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.sqlJs}"><\/script>`,body:`<script>
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
    var SQL = await initSqlJs({ locateFile: function (f) { return "${t}/${d.sqlJsDir}" + f; } });
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
<\/script>`})},Zt={id:"sql-pglite",label:"PostgreSQL (PGlite)",languages:["sql"],layout:"console",usesVendor:!0,heavy:!0,replLanguage:"SQL",tables:!0,build:({content:e,vendorBase:t})=>({body:`<script type="module">
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
  const { PGlite } = await import("${t}/${d.pglite}");
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
<\/script>`})},en={id:"php-wasm",label:"PHP (php-wasm)",languages:["php"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({body:`<div id="php-out"></div>
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
  const { PhpWeb } = await import("${t}/${d.phpWeb}");
  const php = new PhpWeb();
  const out = document.getElementById("php-out");
  let stdout = "";
  php.addEventListener("output", function (e) { stdout += e.detail[0]; out.innerHTML = stdout; });
  php.addEventListener("error", function (e) { console.error(e.detail[0]); });
  const exitCode = await php.run(CODE);
  if (exitCode) console.warn("PHP exited with code: " + exitCode);
} catch (e) { console.error(String(e && e.message || e)); }
<\/script>`})},tn={id:"cpp-jscpp",label:"C++ (JSCPP interpreter)",languages:["cpp"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>{const n=e.replace(/\bstd::/g,""),s=n!==e;return{head:`<script src="${t}/${d.jscpp}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(n)};
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
<\/script>`}}},nn={id:"c-picoc",label:"C (PicoC interpreter)",languages:["c"],layout:"console",usesVendor:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.picoc}"><\/script>`,body:`<script>
(function () {
  var CODE = ${k(e)};
  try {
    picocjs.runC(CODE, function (line) { console.log(line); });
  } catch (e) { console.error(String(e && e.stack || e)); }
})();
<\/script>`})},sn={id:"vue-sfc",label:"Vue SFC",languages:["vue"],layout:"preview",usesVendor:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script src="${t}/${d.vue}"><\/script><script src="${t}/${d.vueSfcLoader}"><\/script>`,body:`<div id="app"></div>
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
<\/script>`})},rn={id:"svelte",label:"Svelte",languages:["svelte"],layout:"preview",usesVendor:!0,scriptBlob:!0,heavy:!0,build:({content:e,vendorBase:t})=>({head:`<script type="importmap">${k({imports:{svelte:`${t}/${d.svelteIndexClient}`,"svelte/internal/client":`${t}/${d.svelteInternalClient}`,"svelte/internal/disclose-version":`${t}/${d.svelteDiscloseVersion}`,"svelte/internal/flags/legacy":`${t}/${d.svelteFlagsLegacy}`,"esm-env":`${t}/${d.svelteEsmEnv}`,"esm-env/browser":`${t}/${d.svelteEsmEnvBrowser}`,"esm-env/development":`${t}/${d.svelteEsmEnvDevelopment}`,"esm-env/node":`${t}/${d.svelteEsmEnvNode}`,clsx:`${t}/${d.svelteClsx}`}})}<\/script><script src="${t}/${d.svelteCompiler}"><\/script>`,body:`<div id="app"></div>
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
<\/script>`})};function on(e,t,n,s){const r=[],o=p=>p==null?"":typeof p=="object"?JSON.stringify(p):String(p),y=p=>{let c=p,l=2;for(;r.some(u=>u.name===c);)c=`${p} (${l++})`;return c};if(t==="json"){let p;try{p=JSON.parse(e)}catch(l){return{tables:r,error:`Invalid JSON: ${String(l)}`}}const c=(l,u)=>{if(!u.length||!u.every(T=>T!==null&&typeof T=="object"&&!Array.isArray(T)))return;const f=u,E=[...new Set(f.flatMap(T=>Object.keys(T)))];E.length&&r.push({name:y(l),columns:E,rows:f.map(T=>E.map(x=>o(T[x])))})};if(Array.isArray(p))c("data",p);else if(p!==null&&typeof p=="object")for(const[l,u]of Object.entries(p))Array.isArray(u)&&c(l,u)}else if(t==="csv"){if(!s)return{tables:r,error:"CSV parser failed to load"};const p=s.parse(e,{delimiter:"",delimitersToGuess:[",","	",";"],dynamicTyping:!1,skipEmptyLines:"greedy"});if(p.errors.length)return{tables:r,error:`CSV parse error: ${p.errors[0].message}`};const c=p.data;if(c.length>=2&&c[0].length>=2){const l=c[0];if(c.slice(1).some(u=>u.length!==l.length))return{tables:r,error:"CSV parse error: inconsistent row width"};r.push({name:"data",columns:l,rows:c.slice(1)})}}else if(t==="markdown"&&n){const p=new n().parse(e,{});let c=null,l=0,u=null,f=[],E=!1,T=!1;for(const x of p)if(x.type==="heading_open")E=!0;else if(x.type==="heading_close")E=!1;else if(x.type==="table_open")u={name:y(c??`Table ${++l}`),columns:[],rows:[]};else if(x.type==="tr_open"&&u)f=[];else if((x.type==="th_open"||x.type==="td_open")&&u)T=!0;else if((x.type==="th_close"||x.type==="td_close")&&u)T=!1;else if(x.type==="inline"){const M=x.children?.filter(R=>R.type==="text"||R.type==="code_inline").map(R=>R.content).join("")??x.content;E?c=M||null:u&&T&&f.push(M)}else x.type==="tr_close"&&u?u.columns.length?u.rows.push(f):u.columns=f:x.type==="table_close"&&u&&(r.push(u),u=null)}return r.length?{tables:r}:{tables:r,message:"No tabular data found"}}function an(e,t){const n=e.find(l=>l.name===t.table);if(!n)throw new Error(`unknown table: ${t.table}`);const s=String(t.search??"").toLocaleLowerCase(),r=s?n.rows.filter(l=>l.some(u=>u.toLocaleLowerCase().includes(s))):n.rows,o=n.columns.indexOf(t.sortBy??""),y=o<0?r:r.map((l,u)=>({row:l,index:u})).sort((l,u)=>{const f=(l.row[o]??"").localeCompare(u.row[o]??"",void 0,{numeric:!0,sensitivity:"base"});return(t.sortDir==="desc"?-f:f)||l.index-u.index}).map(({row:l})=>l),p=Math.max(0,Math.floor(Number(t.offset)||0)),c=Math.min(50,Math.max(1,Math.floor(Number(t.limit)||50)));return{rows:y.slice(p,p+c),total:y.length}}const ln={id:"data-tables",label:"Data tables",languages:["csv","json","markdown"],layout:"console",tables:!0,defaultTab:"tables",noRepl:!0,usesVendor:!0,build:({content:e,vendorBase:t,languageId:n})=>({head:`<script src="${t}/${d.markdown}"><\/script><script src="${t}/${d.papaParse}"><\/script>`,body:`<script>
(function () {
  var source = ${k(e)};
  var language = ${k(n??"csv")};
  var parse = (${on.toString()});
  var query = (${an.toString()});
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
<\/script>`})},cn=[Vt,Ft,Gt,zt,Wt,Ht,Ut,Xt,Kt,Qt,Yt,Zt,en,tn,nn,sn,rn,ln];function Re(e){return e?cn.filter(t=>t.languages.includes(e)):[]}function ds(e){return Re(e).length>0}const ms=globalThis.setInterval,un={class:"flex-grow basis-0 overflow-auto flex flex-col text-xs font-mono min-h-0"},pn={key:0,class:"flex-grow flex items-center justify-center text-white/50 px-4 text-center"},dn={class:"flex items-center gap-2 px-2 py-1 border-b border-black flex-wrap"},mn=["value"],fn=["value"],gn=["value"],hn={class:"overflow-auto flex-grow min-h-0"},wn={class:"border-collapse w-full"},bn={class:"sticky top-0 bg-[#111]"},vn=["onClick"],yn={key:0},xn={key:0},Sn=["colspan"],kn={class:"flex items-center gap-2 px-2 py-1 border-t border-black"},En=["disabled"],Tn=["disabled"],Rn={key:0,class:"text-white/50"},Cn=Te({__name:"sandbox-tables",props:{tables:{},selected:{},columns:{},rows:{},total:{},offset:{},limit:{},sortBy:{},sortDir:{},search:{},loading:{type:Boolean}},emits:["select","search","sort","page","refresh"],setup(e){return(t,n)=>(w(),v("div",un,[e.tables.length?(w(),v(O,{key:1},[h("div",dn,[h("select",{value:e.selected,class:"bg-black border border-white/40 rounded-sm py-0.5",onChange:n[0]||(n[0]=s=>t.$emit("select",s.target.value))},[(w(!0),v(O,null,A(e.tables,s=>(w(),v("option",{key:s.name,value:s.name},_(s.name)+" ("+_(s.rowCount)+") ",9,fn))),128))],40,mn),h("input",{value:e.search,placeholder:"Search…",class:"bg-transparent border border-white/40 rounded-sm px-1 py-0.5 outline-none",onInput:n[1]||(n[1]=s=>t.$emit("search",s.target.value))},null,40,gn),h("button",{class:"border border-white/40 px-2 rounded-sm hover:bg-white/10",onClick:n[2]||(n[2]=s=>t.$emit("refresh"))}," Refresh ")]),h("div",hn,[h("table",wn,[h("thead",bn,[h("tr",null,[(w(!0),v(O,null,A(e.columns,s=>(w(),v("th",{key:s,class:"text-left px-2 py-1 border-b border-white/20 cursor-pointer select-none whitespace-nowrap",onClick:r=>t.$emit("sort",s)},[ne(_(s)+" ",1),e.sortBy===s?(w(),v("span",yn,_(e.sortDir==="asc"?"▲":"▼"),1)):D("",!0)],8,vn))),128))])]),h("tbody",null,[(w(!0),v(O,null,A(e.rows,(s,r)=>(w(),v("tr",{key:r,class:"odd:bg-white/5"},[(w(!0),v(O,null,A(s,(o,y)=>(w(),v("td",{key:y,class:"px-2 py-0.5 whitespace-nowrap max-w-64 overflow-hidden text-ellipsis"},_(o),1))),128))]))),128)),e.rows.length?D("",!0):(w(),v("tr",xn,[h("td",{colspan:e.columns.length,class:"px-2 py-2 text-white/50"},"No rows.",8,Sn)]))])])]),h("div",kn,[h("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset===0,onClick:n[3]||(n[3]=s=>t.$emit("page",-1))},"‹",8,En),h("span",null,_(e.total?e.offset+1:0)+"–"+_(Math.min(e.offset+e.rows.length,e.total))+" of "+_(e.total),1),h("button",{class:"border border-white/40 px-2 rounded-sm disabled:opacity-40",disabled:e.offset+e.limit>=e.total,onClick:n[4]||(n[4]=s=>t.$emit("page",1))},"›",8,Tn),e.loading?(w(),v("span",Rn,"loading…")):D("",!0)])],64)):(w(),v("div",pn," No tables found. Run a note that creates a table or contains tabular data. "))]))}}),_n=Object.assign(Cn,{__name:"EditorSandboxTables"});let $n="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",he=(e=21)=>{let t="",n=crypto.getRandomValues(new Uint8Array(e|=0));for(;e--;)t+=$n[n[e]&63];return t};const Ce=64*1024,On=10;function Dn(e){let t=e.flags;return t.includes("g")||(t+="g"),t.includes("m")||(t+="m"),new RegExp(e.source,t)}function An(e){const t=e.slice(0,Ce).trimStart();if(t.startsWith("{")||t.startsWith("<")||t.startsWith("["))return!1;const n=t.split(/\r?\n/);for(const s of[",",";","	"]){const r=o=>{const y=[];let p="",c=!1;for(let l=0;l<o.length;l++){const u=o[l];u==='"'?c&&o[l+1]==='"'?(p+='"',l++):c=!c:u===s&&!c?(y.push(p.trim()),p=""):p+=u}return y.push(p.trim()),c?null:y};for(let o=0;o<=n.length-3;o++){const y=n.slice(o,o+3);if(y.some(f=>/^\s*[<{]/.test(f)))continue;const p=y.map(r);if(p.some(f=>f===null))continue;const[c,l,u]=p;if(!(c.length<3||c.length!==l.length||c.length!==u.length)&&!c.some(f=>!f||f.split(/\s+/).length>2)&&![c,l,u].some(f=>f.some(E=>/[.!?]$/.test(E))))return!0}}return!1}function fs(e){if(!e.trim())return"plaintext";if(An(e))return"csv";const t=e.slice(0,Ce),n=Mt.filter(s=>s.detectionPatterns&&s.detectionPatterns.length>0).map(s=>{const r=s.detectionPatterns.reduce((o,{pattern:y,weight:p=1})=>{const c=t.match(Dn(y))?.length??0;return o+Math.min(c,On)*p},0);return{languageId:s.id,score:r}});return n.sort((s,r)=>r.score-s.score),n.length>0&&n[0].score>0?n[0].languageId:"plaintext"}function we(e,t){let n;return function(...s){clearTimeout(n),n=setTimeout(()=>e(...s),t)}}const H="not3/sandbox/console",se="not3/sandbox/ready",_e="not3/sandbox/eval",$e="not3/sandbox/tables/request",U="not3/sandbox/tables/result",Oe="not3/sandbox/rows/request",X="not3/sandbox/rows/result",Pn=["log","info","warn","error","debug","clear"],Ln=1e3,jn=200,be=1e4,qn=500,De=200,Nn=200,Mn=new Set(["background","background-attachment","background-clip","background-color","background-image","background-origin","background-position","background-repeat","background-size","border","border-bottom","border-color","border-left","border-radius","border-right","border-style","border-top","border-width","box-decoration-break","box-shadow","color","cursor","display","font","font-family","font-size","font-stretch","font-style","font-variant","font-weight","letter-spacing","line-height","margin","margin-bottom","margin-left","margin-right","margin-top","opacity","outline","outline-color","outline-style","outline-width","padding","padding-bottom","padding-left","padding-right","padding-top","text-decoration","text-decoration-color","text-decoration-line","text-decoration-style","text-shadow","text-transform","vertical-align","white-space","word-break","word-spacing","word-wrap"]),In=/url\(|image-set\(|@import|expression\(|javascript:|[\\<>{}]/i;function Bn(e){if(!e||e.length>Ln)return"";const t=[];for(const n of e.split(";")){const s=n.indexOf(":");if(s===-1)continue;const r=n.slice(0,s).trim().toLowerCase(),o=n.slice(s+1).trim();!o||!Mn.has(r)||In.test(o)||t.push(`${r}: ${o}`)}return t.join("; ")}function Vn(e){if(!(!Array.isArray(e)||e.length===0))return e.slice(0,jn).map(t=>{const n=typeof t=="object"&&t!==null?t:{},s="text"in n?n.text:t;return{text:typeof s=="string"?s:String(s),css:typeof n.css=="string"?Bn(n.css):""}})}function re(e){const t=typeof e=="string"?e:String(e);return t.length>be?t.slice(0,be)+"…":t}function oe(e){const t=Number(e);return Number.isFinite(t)?t:null}function Fn(e){return Array.isArray(e)?e.slice(0,qn).map(t=>{const n=typeof t=="object"&&t!==null?t:{},s=Array.isArray(n.columns)?n.columns.slice(0,De).map(re):[];return{name:re(n.name),columns:s,rowCount:oe(n.rowCount)??0}}):null}function Gn(e){return Array.isArray(e)?e.slice(0,Nn).map(t=>Array.isArray(t)?t.slice(0,De).map(re):[]):null}function zn(e,t){if(typeof e!="object"||e===null)return null;const n=e;if(n.token!==t)return null;if(n.type===se)return{type:se};if(n.type===U){const r=Fn(n.tables);return r?{type:U,tables:r}:null}if(n.type===X){const r=oe(n.id),o=oe(n.total),y=Gn(n.rows);return r===null||o===null||!y?null:{type:X,id:r,total:o,rows:y}}if(n.type!==H||!Pn.includes(n.level)||!Array.isArray(n.args))return null;const s=Vn(n.segments);return{type:H,level:n.level,args:n.args.map(r=>typeof r=="string"?r:String(r)),...s?{segments:s}:{}}}function Wn(e){return`
(function () {
  var TOKEN = ${JSON.stringify(e)};
  var CONSOLE_MSG = ${JSON.stringify(H)};
  var EVAL_MSG = ${JSON.stringify(_e)};
  var READY_MSG = ${JSON.stringify(se)};
  var TABLES_REQ = ${JSON.stringify($e)};
  var TABLES_RES = ${JSON.stringify(U)};
  var ROWS_REQ = ${JSON.stringify(Oe)};
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
`}const Jn="allow-scripts allow-modals";function Hn(e){const t=e.allowNetwork?" https:":"",n=e.vendorOrigin?` ${e.vendorOrigin}`:"",s=e.scriptBlob?" blob:":"",r=[...e.vendorOrigin?[e.vendorOrigin]:[],...e.allowNetwork?["https:","wss:"]:[]],o=["default-src 'none'",`script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'${s}${n}${t}`,`style-src 'unsafe-inline'${n}${t}`,`img-src data: blob:${n}${t}`,`font-src data:${n}${t}`,`media-src data: blob:${n}${t}`];return(e.vendorOrigin||e.scriptBlob)&&o.push(`worker-src blob:${n}`),o.push(`connect-src ${r.length?r.join(" "):"'none'"}`,"form-action 'none'","base-uri 'none'"),o.join("; ")}function Un(e,t){const n=(t||"/").replace(/^\/*/,"/").replace(/\/*$/,"/");return`${e.replace(/\/$/,"")}${n}vendor`}function Xn(e){const t=e.runner.build({content:e.content,languageId:e.languageId,vendorBase:Un(e.origin,e.basePath),theme:e.theme}),s=`<meta http-equiv="Content-Security-Policy" content="${Hn({allowNetwork:e.allowNetwork,vendorOrigin:e.runner.usesVendor?e.origin:null,scriptBlob:e.runner.scriptBlob===!0})}"><script>${Wn(e.token)}<\/script>`+(t.head??"");if(t.bare)return"<!doctype html>"+s+t.body;const r=e.runner.layout==="preview"?"<style>body{background:#fff}</style>":"<style>body{background:#1e1e1e}</style>";return"<!doctype html><html><head>"+s+r+"</head><body>"+t.body+"</body></html>"}function ve(e,t,n,s){return t&&e.set(t,n),e.get(s.id)??!s.heavy}function ye(e){return e.tables&&e.defaultTab==="tables"?"tables":"console"}const Kn=100;function Qn(){const e=new Map,t=n=>{let s=e.get(n);return s||(s={commands:[],cursor:null,draft:""},e.set(n,s)),s};return{record(n,s){if(!s)return;const r=t(n);r.commands.push(s),r.commands.length>Kn&&r.commands.shift(),r.cursor=null,r.draft=""},navigate(n,s,r){const o=t(n);return o.commands.length?s==="up"?(o.cursor===null?(o.draft=r,o.cursor=o.commands.length-1):o.cursor=Math.max(0,o.cursor-1),o.commands[o.cursor]):o.cursor===null?r:o.cursor===o.commands.length-1?(o.cursor=null,o.draft):o.commands[++o.cursor]:r},switchRunner(n,s,r){if(n){const o=t(n);o.cursor===null&&(o.draft=r),o.cursor=null}return t(s).draft}}}const Yn={class:"w-full h-full flex flex-col bg-[#111] text-white min-w-0 min-h-0"},Zn={class:"flex items-center gap-3 px-2 py-1 bg-black text-sm flex-wrap"},es={class:"font-bold select-none"},ts=["value"],ns={class:"flex items-center gap-1 select-none cursor-pointer",title:"Re-run automatically when the note changes"},ss={class:"flex items-center gap-1 select-none cursor-pointer",title:"Allow the sandbox to load resources from and connect to https:// hosts. Off by default so note code cannot send data anywhere."},rs=["srcdoc","sandbox"],os={key:0,class:"flex items-center gap-1 px-2 py-1 bg-black/60 text-xs"},as=["onClick"],is=["placeholder"],xe=500,te=50,ls=700,cs=15,us=Te({__name:"sandbox-panel",props:{content:{},languageId:{},popout:{type:Boolean},resizing:{type:Boolean}},emits:["close","popout","engine"],setup(e,{emit:t}){const n=e,s=t,r={log:"text-gray-100",info:"text-blue-300",warn:"text-yellow-400",error:"text-red-400",debug:"text-gray-500",input:"text-green-400"},{uiBaseURL:o}=Ge().public,y=C(),p=C(),c=C([]),l=C(""),u=Qn(),f=C(!0),E=C(!1),T=C("");let x="";const M=new Map,R=C("");F(R,a=>s("engine",a));const j=ee(()=>Re(n.languageId)),S=ee(()=>j.value.find(a=>a.id===R.value)??j.value[0]??null),P=C("console"),q=C([]),$=C(""),m=C({rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1});let ae=0,z=null,ie=0;const Ae=ee(()=>q.value.find(a=>a.name===$.value)?.columns??[]);function Q(a){y.value?.contentWindow?.postMessage({...a,token:x},"*")}function W(){z&&clearTimeout(z),z=null}function Y(){if(!S.value?.tables)return;W(),ie=0;const a=()=>{Q({type:$e}),++ie<cs&&(z=setTimeout(a,ls))};a()}function I(){$.value&&(m.value.loading=!0,Q({type:Oe,query:{id:++ae,table:$.value,offset:m.value.offset,limit:te,sortBy:m.value.sortBy??void 0,sortDir:m.value.sortDir,search:m.value.search||void 0}}))}function le(){W(),q.value=[],$.value="",m.value={rows:[],total:0,offset:0,sortBy:null,sortDir:"asc",search:"",loading:!1}}function Pe(a){P.value=a,a==="tables"&&Y()}function Le(a){$.value=a,m.value.offset=0,m.value.sortBy=null,m.value.sortDir="asc",m.value.search="",I()}const je=we(I,300);function qe(a){m.value.search=a,m.value.offset=0,je()}function Ne(a){m.value.sortBy===a?m.value.sortDir=m.value.sortDir==="asc"?"desc":"asc":(m.value.sortBy=a,m.value.sortDir="asc"),I()}function Me(a){m.value.offset=Math.max(0,m.value.offset+a*te),I()}function Ie(a){return a.segments??[{text:a.text,css:""}]}function ce(a){c.value.push(a),c.value.length>xe&&c.value.splice(0,c.value.length-xe),Xe(()=>p.value?.scrollTo({top:p.value.scrollHeight}))}function B(){S.value&&(P.value=ye(S.value),c.value=[],le(),x=he(),T.value=Xn({runner:S.value,content:n.content,languageId:n.languageId,token:x,allowNetwork:E.value,origin:window.location.origin,basePath:o,theme:"dark"}),S.value.tables&&Y())}function ue(a){if(!y.value||a.source!==y.value.contentWindow)return;const i=zn(a.data,x);if(i){if(i.type===U){W(),q.value=i.tables,q.value.some(L=>L.name===$.value)||($.value=q.value[0]?.name??"",m.value.offset=0),$.value&&I();return}if(i.type===X){if(i.id!==ae)return;m.value.rows=i.rows,m.value.total=i.total,m.value.loading=!1;return}i.type===H&&(i.level==="clear"?c.value=[]:ce({level:i.level,text:i.args.join(" "),segments:i.segments}))}}function Be(){const a=l.value.trim();!a||!y.value?.contentWindow||(S.value&&u.record(S.value.id,a),ce({level:"input",text:"> "+a}),P.value="console",Q({type:_e,code:a}),l.value="")}function pe(a){S.value&&(l.value=u.navigate(S.value.id,a,l.value))}const Ve=we(()=>{f.value&&B()},1e3);return F(()=>n.content,()=>Ve()),F(E,B),F(j,a=>{a.some(i=>i.id===R.value)||(R.value=a[0]?.id??"")}),F([S,()=>n.languageId],([a,i],[L,b])=>{if(!a){s("close");return}const V=a.id!==L?.id;!V&&i===b||(V&&(l.value=u.switchRunner(L?.id??"",a.id,l.value),f.value=ve(M,L?.id??null,f.value,a)),P.value=ye(a),f.value?B():(x=he(),c.value=[],le(),T.value=""))}),ze(()=>{window.addEventListener("message",ue),R.value=j.value[0]?.id??"",f.value=S.value?ve(M,null,f.value,S.value):!0,B()}),We(()=>{window.removeEventListener("message",ue),W()}),(a,i)=>{const L=_n;return w(),v("div",Yn,[h("div",Zn,[h("span",es,_(g(S)?.label||"Sandbox"),1),g(j).length>1?N((w(),v("select",{key:0,"onUpdate:modelValue":i[0]||(i[0]=b=>J(R)?R.value=b:null),class:"bg-black border border-white/40 rounded-sm text-xs py-0.5",title:"Execution engine for this language"},[(w(!0),v(O,null,A(g(j),b=>(w(),v("option",{key:b.id,value:b.id},_(b.label),9,ts))),128))],512)),[[Je,g(R)]]):D("",!0),h("button",{class:"sandbox-btn",onClick:B},"Run"),h("button",{class:"sandbox-btn",onClick:i[1]||(i[1]=b=>c.value=[])},"Clear"),h("label",ns,[N(h("input",{"onUpdate:modelValue":i[2]||(i[2]=b=>J(f)?f.value=b:null),type:"checkbox"},null,512),[[me,g(f)]]),i[9]||(i[9]=ne(" auto ",-1))]),h("label",ss,[N(h("input",{"onUpdate:modelValue":i[3]||(i[3]=b=>J(E)?E.value=b:null),type:"checkbox"},null,512),[[me,g(E)]]),i[10]||(i[10]=ne(" network ",-1))]),i[11]||(i[11]=h("div",{class:"flex-grow"},null,-1)),e.popout?D("",!0):(w(),v("button",{key:1,class:"sandbox-btn",title:"Move this panel into a separate window",onClick:i[4]||(i[4]=b=>a.$emit("popout"))},"Popout")),h("button",{class:G(e.popout?"sandbox-btn":"sandbox-btn sm:hidden"),onClick:i[5]||(i[5]=b=>a.$emit("close"))},"Close",2)]),h("iframe",{ref_key:"iframe",ref:y,srcdoc:g(T),sandbox:g(Jn),referrerpolicy:"no-referrer",class:G([g(S)?.layout==="preview"?"w-full flex-grow bg-white border-none":"hidden",e.resizing?"pointer-events-none":""])},null,10,rs),g(S)?.tables?(w(),v("div",os,[(w(),v(O,null,A(["console","tables"],b=>h("button",{key:b,class:G(["px-2 rounded-sm border border-white/40 capitalize",g(P)===b?"bg-white/20":"hover:bg-white/10"]),onClick:V=>Pe(b)},_(b),11,as)),64))])):D("",!0),g(S)?.tables?N((w(),He(L,{key:1,tables:g(q),selected:g($),columns:g(Ae),rows:g(m).rows,total:g(m).total,offset:g(m).offset,limit:te,"sort-by":g(m).sortBy,"sort-dir":g(m).sortDir,search:g(m).search,loading:g(m).loading,onSelect:Le,onSearch:qe,onSort:Ne,onPage:Me,onRefresh:Y},null,8,["tables","selected","columns","rows","total","offset","sort-by","sort-dir","search","loading"])),[[fe,g(P)==="tables"]]):D("",!0),N(h("div",{ref_key:"output",ref:p,class:G(["overflow-y-auto font-mono text-xs px-2 py-1",g(S)?.layout==="preview"?"h-48 border-t border-black flex-shrink-0":"flex-grow basis-0"])},[(w(!0),v(O,null,A(g(c),(b,V)=>(w(),v("div",{key:V,class:G(["whitespace-pre-wrap break-all",r[b.level]])},[(w(!0),v(O,null,A(Ie(b),(de,Fe)=>(w(),v("span",{key:Fe,style:Ke(de.css)},_(de.text),5))),128))],2))),128))],2),[[fe,g(P)==="console"]]),g(S)?.noRepl?D("",!0):(w(),v("form",{key:2,class:"flex items-center border-t border-black",onSubmit:Z(Be,["prevent"])},[i[12]||(i[12]=h("span",{class:"pl-2 pr-1 py-1 text-green-400 font-mono text-xs select-none"},">",-1)),N(h("input",{"onUpdate:modelValue":i[6]||(i[6]=b=>J(l)?l.value=b:null),class:"flex-grow bg-transparent font-mono text-xs py-1 pr-2 outline-none",placeholder:`Run ${g(S)?.replLanguage??"JavaScript"} in the sandbox…`,onKeydown:[i[7]||(i[7]=ge(Z(b=>pe("up"),["prevent"]),["up"])),i[8]||(i[8]=ge(Z(b=>pe("down"),["prevent"]),["down"]))]},null,40,is),[[Ue,g(l)]])],32))])}}}),gs=Object.assign(Qe(us,[["__scopeId","data-v-0cb1daa9"]]),{__name:"EditorSandboxPanel"}),Se="not3/popout/ready",ke="not3/popout/state",Ee="not3/popout/engine";function hs(e){if(typeof e!="object"||e===null)return null;const t=e;return t.type===Se?{type:Se}:t.type===Ee?t.engineId!=="sql-sqljs"&&t.engineId!=="sql-pglite"?null:{type:Ee,engineId:t.engineId}:t.type!==ke||typeof t.content!="string"||typeof t.languageId!="string"?null:{type:ke,content:t.content,languageId:t.languageId}}let K=null;function ws(e){K=e}function bs(){return K}function vs(){try{K?.close()}catch{}K=null}export{Se as P,gs as _,ke as a,Ee as b,ws as c,vs as d,we as e,An as f,bs as g,fs as h,ds as i,Mt as l,hs as p,ms as s};
