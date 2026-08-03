import {
  SANDBOX_CONSOLE_MESSAGE,
  SANDBOX_EVAL_MESSAGE,
  SANDBOX_READY_MESSAGE,
} from "./protocol";

/**
 * JS source that must run FIRST inside the sandbox iframe. It relays
 * console output / uncaught errors to the parent window and answers
 * REPL eval requests. All messages carry the per-run token.
 */
export function buildBootstrap(token: string): string {
  return `
(function () {
  var TOKEN = ${JSON.stringify(token)};
  var CONSOLE_MSG = ${JSON.stringify(SANDBOX_CONSOLE_MESSAGE)};
  var EVAL_MSG = ${JSON.stringify(SANDBOX_EVAL_MESSAGE)};
  var READY_MSG = ${JSON.stringify(SANDBOX_READY_MESSAGE)};
  var MAX_ARG_LENGTH = 10000;

  function post(level, args) {
    try {
      window.parent.postMessage({ type: CONSOLE_MSG, token: TOKEN, level: level, args: args }, "*");
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
      return s.length > MAX_ARG_LENGTH ? s.slice(0, MAX_ARG_LENGTH) + "…" : s;
    });
  }

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    var original = console[level] ? console[level].bind(console) : null;
    console[level] = function () {
      post(level, toStrings(arguments));
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
    if (data.token !== TOKEN || data.type !== EVAL_MSG) return;
    try {
      var result = (0, eval)(String(data.code));
      post("log", [serialize(result, 0, [])]);
    } catch (e) {
      post("error", [serialize(e, 0, [])]);
    }
  });

  window.parent.postMessage({ type: READY_MSG, token: TOKEN }, "*");
})();
`;
}
