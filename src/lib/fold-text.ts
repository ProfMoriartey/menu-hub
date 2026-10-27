// src/lib/fold-text.ts

/*
 * Text folded for search, so "kofte" finds "Köfte", "cafe" finds "Café" and
 * "اكلة" finds "أكلة". The same table runs in the browser (foldText) and in
 * Postgres (FOLD_FROM / FOLD_TO with translate(), see app/actions/search),
 * so both sides agree on what matches. No database extension is needed.
 */

// Letters that fold to another letter. Each entry: [from letters, to letter].
const PAIRS: [string, string][] = [
  ["áàâäãåāăą", "a"],
  ["çćč", "c"],
  ["ďđ", "d"],
  ["éèêëēėęě", "e"],
  ["ğ", "g"],
  ["íìîïīįı", "i"],
  ["ł", "l"],
  ["ñńň", "n"],
  ["óòôöõøōő", "o"],
  ["ŕř", "r"],
  ["śšş", "s"],
  ["ťţ", "t"],
  ["úùûüūůű", "u"],
  ["ýÿ", "y"],
  ["źżž", "z"],
  ["ß", "s"],
  ["æ", "a"],
  ["œ", "o"],
  // Russian
  ["ё", "е"],
  ["й", "и"],
  // Arabic: hamza and madda forms of alef, alef maqsura, teh marbuta, and
  // hamza on waw / yeh.
  ["أإآٱ", "ا"],
  ["ىئ", "ي"],
  ["ة", "ه"],
  ["ؤ", "و"],
];

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCharCode(from + i)).join("");

// Characters dropped altogether: combining accents (what's left of "İ"
// after lower() in Postgres, for one), Arabic short vowels and tatweel.
const DROPPED = range(0x0300, 0x036f) + range(0x064b, 0x0652) + String.fromCharCode(0x0670, 0x0640);

/** translate(text, FOLD_FROM, FOLD_TO) folds lower-cased text in SQL. */
export const FOLD_FROM = PAIRS.map(([from]) => from).join("") + DROPPED;
export const FOLD_TO = PAIRS.map(([from, to]) => to.repeat([...from].length)).join("");

const MAP = new Map<string, string>();
for (const [from, to] of PAIRS) for (const char of from) MAP.set(char, to);
for (const char of DROPPED) MAP.set(char, "");

/** Lower case in `locale`, accents and the letter variants above folded. */
export function foldText(text: string, locale: string): string {
  let folded = "";
  // Decomposed first, so accents the table doesn't list are dropped too.
  for (const char of text.toLocaleLowerCase(locale).normalize("NFD")) {
    if (/\p{Mn}/u.test(char) && !MAP.has(char)) continue;
    folded += MAP.get(char) ?? char;
  }
  return folded;
}
