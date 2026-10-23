// Lists t("key") calls whose key is missing in any locale file.
// Usage: node scripts/i18n/check-keys.cjs [project root, default "."]
// Only literal keys are checked; keys built at runtime (t(`a.${x}`)) are not.
const fs = require("fs");
const path = require("path");

const root = process.argv[2] ?? ".";
const locales = ["en", "tr", "ar", "es", "ru"].map((l) => [
  l,
  JSON.parse(fs.readFileSync(path.join(root, "src/messages", l + ".json"), "utf8")),
]);
const get = (o, p) => p.split(".").reduce((a, k) => (a && typeof a === "object" ? a[k] : undefined), o);

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f)) files.push(p);
  }
})(path.join(root, "src"));

const missing = [];
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const decls = [...s.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*"([^"]+)"\s*\)/g)];
  // A file can declare the same variable in several components with
  // different namespaces; a key is fine if any of them has it.
  const byVar = new Map();
  for (const [, v, ns] of decls) byVar.set(v, [...(byVar.get(v) ?? []), ns]);
  for (const [v, namespaces] of byVar) {
    // t("key") and t.rich("key", …)
    const call = new RegExp("\\b" + v + "(?:\\.rich)?\\(\\s*\"([^\"]+)\"", "g");
    for (const m of s.matchAll(call)) {
      for (const [l, msg] of locales) {
        if (namespaces.every((ns) => get(msg, ns + "." + m[1]) === undefined)) {
          missing.push(`${l}  ${namespaces.join("|")}.${m[1]}  (${path.relative(root, f)})`);
        }
      }
    }
  }
}
console.log(missing.length ? [...new Set(missing)].join("\n") : "none missing");
