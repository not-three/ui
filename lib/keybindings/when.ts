export type KeyContext = "editorTextFocus" | "not3.page" | "not3.draw";

const contexts = new Set<KeyContext>(["editorTextFocus", "not3.page", "not3.draw"]);
type Node = { type: "name"; name: KeyContext } | { type: "not"; child: Node } | { type: "and" | "or"; left: Node; right: Node };

export function parseWhen(expression: unknown): (context: KeyContext) => boolean {
  if (expression === undefined) return () => true;
  if (typeof expression !== "string" || !expression.trim()) throw new Error("Invalid when expression");
  const tokens = expression.match(/editorTextFocus|not3\.page|not3\.draw|&&|\|\||!|\(|\)|\S+/g) ?? [];
  let at = 0;
  const primary = (): Node => {
    const token = tokens[at++];
    if (token === "!") return { type: "not", child: primary() };
    if (token === "(") {
      const node = or();
      if (tokens[at++] !== ")") throw new Error("Unclosed when expression");
      return node;
    }
    if (contexts.has(token as KeyContext)) return { type: "name", name: token as KeyContext };
    throw new Error(`Unsupported when clause: ${token ?? "end of expression"}`);
  };
  const and = (): Node => {
    let node = primary();
    while (tokens[at] === "&&") { at++; node = { type: "and", left: node, right: primary() }; }
    return node;
  };
  const or = (): Node => {
    let node = and();
    while (tokens[at] === "||") { at++; node = { type: "or", left: node, right: and() }; }
    return node;
  };
  const root = or();
  if (at !== tokens.length) throw new Error(`Unexpected when token: ${tokens[at]}`);
  const evaluate = (node: Node, context: KeyContext): boolean => {
    switch (node.type) {
      case "name": return node.name === context;
      case "not": return !evaluate(node.child, context);
      case "and": return evaluate(node.left, context) && evaluate(node.right, context);
      case "or": return evaluate(node.left, context) || evaluate(node.right, context);
    }
  };
  return (context) => evaluate(root, context);
}

export function evaluateWhen(expression: unknown, context: KeyContext): boolean {
  return parseWhen(expression)(context);
}
