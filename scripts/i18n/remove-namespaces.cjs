// Removes top-level namespaces from each locale file without reformatting it.
// Usage: node scripts/i18n/remove-namespaces.cjs src/messages <Namespace> [<Namespace>…]
const fs = require("fs");
const path = require("path");

const [dir, ...names] = process.argv.slice(2);

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const full = path.join(dir, file);
  let raw = fs.readFileSync(full, "utf8");
  const before = JSON.parse(raw);
  const lines = raw.split(/(?<=\n)/); // keep line endings

  for (const name of names) {
    if (!(name in before)) continue;
    const start = lines.findIndex((l) => l.startsWith(`  ${JSON.stringify(name)}: {`));
    if (start < 0) throw new Error(`${file}: can't find ${name}`);
    // The block ends at the next line that closes at the same (2-space) depth.
    let end = start;
    while (!/^  \},?\r?\n?$/.test(lines[end])) end++;
    const wasLast = !lines[end].includes(",");
    lines.splice(start, end - start + 1);
    // If it was the last entry, drop the comma from the entry before it.
    if (wasLast) lines[start - 1] = lines[start - 1].replace(/,(\r?\n)$/, "$1");
  }

  raw = lines.join("");
  const after = JSON.parse(raw);
  for (const name of names) if (name in after) throw new Error(`${file}: ${name} still there`);
  const kept = Object.keys(before).filter((k) => !names.includes(k));
  for (const key of kept) {
    if (JSON.stringify(after[key]) !== JSON.stringify(before[key])) throw new Error(`${file}: ${key} changed`);
  }
  fs.writeFileSync(full, raw);
  console.log(`${file}: removed ${names.filter((n) => n in before).join(", ") || "nothing"}`);
}
