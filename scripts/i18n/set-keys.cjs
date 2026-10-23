// Adds keys inside existing top-level namespaces of each locale file.
// Usage: node scripts/i18n/set-keys.cjs src/messages <keys json>
// keys json: { "<locale>": { "Namespace.path.key": "message", ... }, ... }
// Only the touched namespace blocks are rewritten, and only if they were
// already in JSON.stringify(…, null, 2) layout, so nothing else moves.
const fs = require("fs");
const path = require("path");

const [dir, keysFile] = process.argv.slice(2);
const byLocale = JSON.parse(fs.readFileSync(keysFile, "utf8"));

for (const [locale, keys] of Object.entries(byLocale)) {
  const file = path.join(dir, `${locale}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const original = JSON.parse(raw);
  const lines = raw.split(/\r?\n/);

  const byNamespace = {};
  for (const [dotted, value] of Object.entries(keys)) {
    const [ns, ...rest] = dotted.split(".");
    (byNamespace[ns] ??= []).push([rest, value]);
  }

  for (const [ns, entries] of Object.entries(byNamespace)) {
    const start = lines.findIndex((l) => l === `  ${JSON.stringify(ns)}: {`);
    if (start < 0) throw new Error(`${file}: namespace ${ns} not found`);
    let end = start;
    while (!/^  \},?$/.test(lines[end])) end++;
    const trailingComma = lines[end].endsWith(",");

    const render = (obj) => {
      const body = JSON.stringify(obj, null, 2).split("\n");
      return [`  ${JSON.stringify(ns)}: ${body[0]}`, ...body.slice(1).map((l) => `  ${l}`)];
    };
    const expectedBefore = render(original[ns]);
    expectedBefore[expectedBefore.length - 1] += trailingComma ? "," : "";
    if (lines.slice(start, end + 1).join("\n") !== expectedBefore.join("\n")) {
      throw new Error(`${file}: ${ns} isn't in the expected layout; refusing to rewrite it`);
    }

    const updated = structuredClone(original[ns]);
    for (const [pathParts, value] of entries) {
      let node = updated;
      for (const part of pathParts.slice(0, -1)) {
        if (typeof node[part] !== "object") throw new Error(`${file}: ${ns}.${pathParts.join(".")} has no parent`);
        node = node[part];
      }
      const leaf = pathParts[pathParts.length - 1];
      if (leaf in node) throw new Error(`${file}: ${ns}.${pathParts.join(".")} already exists`);
      node[leaf] = value;
    }
    const replacement = render(updated);
    replacement[replacement.length - 1] += trailingComma ? "," : "";
    lines.splice(start, end - start + 1, ...replacement);
    original[ns] = updated;
  }

  const out = lines.join(eol);
  const parsed = JSON.parse(out);
  if (JSON.stringify(parsed) !== JSON.stringify(original)) throw new Error(`${file}: result mismatch`);
  fs.writeFileSync(file, out);
  console.log(`${locale}: ${Object.keys(keys).length} keys`);
}
