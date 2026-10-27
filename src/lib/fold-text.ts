// src/lib/fold-text.ts

/*
 * Text folded for search, in every language: lower case, then every accent
 * dropped, so "kofte" finds "Köfte", "souvlaki" finds "σουβλάκι" typed
 * without tonos, and Arabic or Hebrew vowel marks don't stop a match.
 *
 * How: text is decomposed (Unicode NFD), which splits an accented letter
 * into its base letter and combining marks, and the marks are removed. A
 * short table covers letters that don't decompose (ı, ø, ł, ß, ة, …).
 *
 * The same rules run in the browser (foldText) and in Postgres
 * (app/actions/search: normalize, regexp_replace with
 * droppedMarksClass, then translate), so both sides agree on what matches.
 */

// Marks that are vowels or change the sound, not accents: whole scripts
// (Devanagari to Sinhala, Thai, Lao, Tibetan, Myanmar, Khmer, Balinese,
// Javanese) and the Japanese voicing marks (が is not か). Dropping them
// would turn different words into the same one.
const KEPT_MARK_BLOCKS: [number, number][] = [
  [0x0900, 0x0dff],
  [0x0e00, 0x0fff],
  [0x1000, 0x109f],
  [0x1780, 0x17ff],
  [0x1b00, 0x1bff],
  [0xa980, 0xa9df],
  [0x3099, 0x309a],
];

const MARK = /[\p{Mn}\p{Me}]/u;

const isDroppedMark = (char: string) => {
  if (!MARK.test(char)) return false;
  const code = char.codePointAt(0)!;
  return !KEPT_MARK_BLOCKS.some(([from, to]) => code >= from && code <= to);
};

// Lower-case letters that don't decompose, each [from letters, to letter].
const LETTERS: [string, string][] = [
  ["ı", "i"],
  ["ȷ", "j"],
  ["øǿ", "o"],
  ["ł", "l"],
  ["ŀ", "l"],
  ["đð", "d"],
  ["ħ", "h"],
  ["ŧ", "t"],
  ["ß", "s"],
  ["æ", "a"],
  ["œ", "o"],
  ["ƒ", "f"],
  // Greek final sigma
  ["ς", "σ"],
  // Arabic: teh marbuta, alef maqsura and the Persian forms of yeh and kaf
  ["ة", "ه"],
  ["ىی", "ي"],
  ["ک", "ك"],
];

// Dropped outright: the Arabic tatweel (a stretching stroke, not a letter).
const REMOVED = String.fromCharCode(0x0640);

/** translate(text, FOLD_FROM, FOLD_TO) applies the letter table in SQL. */
export const FOLD_FROM = LETTERS.map(([from]) => from).join("") + REMOVED;
export const FOLD_TO = LETTERS.map(([from, to]) => to.repeat([...from].length)).join("");

const LETTER_MAP = new Map<string, string>();
for (const [from, to] of LETTERS) for (const char of from) LETTER_MAP.set(char, to);
LETTER_MAP.set(REMOVED, "");

/** Lower case in `locale`, accents dropped, letter variants folded. */
export function foldText(text: string, locale: string): string {
  let folded = "";
  for (const char of text.toLocaleLowerCase(locale).normalize("NFD")) {
    if (isDroppedMark(char)) continue;
    folded += LETTER_MAP.get(char) ?? char;
  }
  return folded;
}

let markClass: string | null = null;

/**
 * A regular expression bracket matching every mark foldText drops, for
 * regexp_replace in Postgres (which has no Unicode property classes).
 * Built once from the same test the browser uses.
 */
export function droppedMarksClass(): string {
  if (markClass) return markClass;
  const ranges: string[] = [];
  let start = -1;
  const scan = (from: number, to: number) => {
    for (let code = from; code <= to + 1; code++) {
      const dropped = code <= to && isDroppedMark(String.fromCodePoint(code));
      if (dropped && start < 0) start = code;
      if (!dropped && start >= 0) {
        const first = String.fromCodePoint(start);
        ranges.push(start === code - 1 ? first : `${first}-${String.fromCodePoint(code - 1)}`);
        start = -1;
      }
    }
  };
  // Marks live in the first two planes, plus variation selectors.
  scan(0x0300, 0x1ffff);
  scan(0xe0100, 0xe01ef);
  markClass = `[${ranges.join("")}]`;
  return markClass;
}
