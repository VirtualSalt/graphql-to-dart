import { SafeString } from "handlebars";

type String = SafeString | string;

export function logThis(this: any) {
  console.error(this);
}

export function log(...args) {
  args.pop(); // remove handlebars metadata
  console.log(...args);
}

// very innefficient structural dedupe
export function dedupe<T = string>(arr: T[], hash = JSON.stringify) {
  let seen: Set<string> = new Set();
  return arr.filter(item => {
    const hashed = hash(item);
    if (seen.has(hashed)) {
      return false; // already seen
    }
    seen.add(hashed);
    return true; // fresh
  });
}

export function arrayify<T>(arr: T | T[]) {
  return Array.isArray(arr) ? arr : [arr];
}

export function stripLeadingUnderscores(lower) {
  return lower.replace("_", "", "g");
}

export function transformCharacters(str, characterMap = { "^_": "" }) {
  return Object.keys(characterMap)
    .reduce(
      (transformed, regex) =>
        transformed.replace(new RegExp(regex), characterMap[regex], "g"),
      str
    )
    .replace(/([-_]\w)/g, s => s[1].toUpperCase()); // snake to camel
}

export function capitalize(lower) {
  return lower.replace(/^\w/, c => c.toUpperCase());
}

export function camelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/^\w/, c => c.toLowerCase());
}

export function concat(...args) {
  if (Array.isArray(args[0])) {
    return [].concat(...args.slice(0, -1));
  }
  return args.slice(0, -1).join("");
}

export function eachBackwards(context, options) {
  var ret = "";

  for (var i = context.length - 1, j = 0; i >= j; i--) {
    ret = ret + options.fn(context[i]);
  }

  return ret;
}

export function takeFirst(arg, b) {
  if (arg !== null && arg !== undefined) {
    return arg;
  }
  return b;
}

export function takeLastWord(str: String) {
  const words = str
    .toString()
    .trim()
    .split(/\s+/g);
  return new SafeString(words[words.length - 1]);
}

function ensureTrailing(s: string, substr: string) {
  return s.endsWith(substr) ? s : s + substr;
}

export function callMethod(o: object, method: string, ...args): boolean {
  const last = args[args.length - 1];
  if (last && last.name === "callMethod") {
    args.pop(); // remove handlebars metadata
  }

  return o[method](...args);
}

export function dartDirective(directive: string, statement: string | string[]) {
  return new SafeString(
    arrayify(statement)
      .map(s =>
        s.startsWith(directive)
          ? ensureTrailing(s, ";")
          : `${directive} '${s}';`
      )
      .join("\n")
  );
}

export function stripSuffix(name, suffix) {
  return name.replace(new RegExp(suffix + "$"), "");
}

export function inputBaseType(name) {
  return stripSuffix(name, "Input");
}

export function wrapFields(interfaces = []) {
  return interfaces.map(i => `_${i}Fields`);
}
