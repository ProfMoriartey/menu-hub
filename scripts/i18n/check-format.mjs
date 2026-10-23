// scripts/i18n/check-format.mjs
// Formats every message in every locale with next-intl (ICU syntax, plurals,
// rich text) and checks that every server error code in ACTION_ERROR_CODES
// has a message in ActionErrors, and nothing extra.
// Usage: node scripts/i18n/check-format.mjs   (from the project root)
import fs from "fs";
import { createTranslator } from "next-intl";

const LOCALES = ["en", "tr", "ar", "es", "ru"];
// Every placeholder in a message gets a number (fine for plain text, and
// needed for plurals), tried at several values to hit every plural form.
// Rich-text tags (<b>…</b>) get a function.
const COUNTS = [0, 1, 2, 3, 5, 11, 21, 100];
function sampleValues(message, n) {
  const values = {};
  for (const [, name] of message.matchAll(/\{\s*(\w+)/g)) values[name] = n;
  for (const [, tag] of message.matchAll(/<(\w+)>/g)) values[tag] = (chunks) => chunks;
  return values;
}

const source = fs.readFileSync("src/lib/action-result.ts", "utf8");
const list = source.slice(source.indexOf("ACTION_ERROR_CODES = ["), source.indexOf("] as const"));
const codes = [...list.matchAll(/^\s*"([A-Za-z]+)",/gm)].map((m) => m[1]);

let problems = 0;
let checked = 0;
for (const locale of LOCALES) {
  const messages = JSON.parse(fs.readFileSync(`src/messages/${locale}.json`, "utf8"));
  const t = createTranslator({
    locale,
    messages,
    onError: (e) => {
      problems++;
      console.log(`${locale}  ${e.code}  ${e.message}`);
    },
  });

  const walk = (node, path) => {
    for (const [key, value] of Object.entries(node)) {
      const full = path ? `${path}.${key}` : key;
      if (typeof value !== "string") {
        walk(value, full);
        continue;
      }
      for (const n of COUNTS) {
        const values = sampleValues(value, n);
        if (/<\w+>/.test(value)) t.rich(full, values);
        else t(full, values);
      }
      checked++;
    }
  };
  walk(messages, "");

  const missing = codes.filter((code) => !(code in (messages.ActionErrors ?? {})));
  const extra = Object.keys(messages.ActionErrors ?? {}).filter((key) => !codes.includes(key));
  if (missing.length) { problems++; console.log(`${locale}  ActionErrors missing: ${missing.join(", ")}`); }
  if (extra.length) { problems++; console.log(`${locale}  ActionErrors with no code: ${extra.join(", ")}`); }
}

console.log(`checked ${checked} messages and ${codes.length} error codes in ${LOCALES.length} locales: ${problems} problems`);
process.exit(problems ? 1 : 0);
