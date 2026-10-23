// Appends top-level namespaces to each locale file without reformatting it.
// Usage: node scripts/i18n/add-namespaces.cjs src/messages <namespaces json>
// namespaces json: { "<locale>": { "<Namespace>": { ...messages } }, ... }
const fs = require("fs");
const path = require("path");

const [dir, sourceFile] = process.argv.slice(2);
const source = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

for (const [locale, namespaces] of Object.entries(source)) {
  const file = path.join(dir, `${locale}.json`);
  let raw = fs.readFileSync(file, "utf8");
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const existing = JSON.parse(raw);

  for (const name of Object.keys(namespaces)) {
    if (name in existing) throw new Error(`${file} already has ${name}`);
  }

  const block = Object.entries(namespaces)
    .map(([name, value]) =>
      `  ${JSON.stringify(name)}: ${JSON.stringify(value, null, 2).split("\n").join(`${eol}  `)}`,
    )
    .join(`,${eol}`);

  // Insert before the file's final closing brace, after its last entry.
  const end = raw.lastIndexOf("}");
  const before = raw.slice(0, end).replace(/\s*$/, "");
  raw = `${before},${eol}${block}${eol}}${raw.slice(end + 1)}`;

  const parsed = JSON.parse(raw);
  for (const name of Object.keys(namespaces)) {
    if (JSON.stringify(parsed[name]) !== JSON.stringify(namespaces[name])) {
      throw new Error(`${file}: ${name} did not round-trip`);
    }
  }
  if (Object.keys(parsed).length !== Object.keys(existing).length + Object.keys(namespaces).length) {
    throw new Error(`${file}: unexpected key count`);
  }
  fs.writeFileSync(file, raw);
  console.log(`${locale}: added ${Object.keys(namespaces).join(", ")}`);
}
