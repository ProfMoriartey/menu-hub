// src/lib/slug.ts

export function slugify(name: string): string {
  return name
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Picks "name", then "name-2", "name-3"… so the slug is free among `taken`.
// Names with no Latin letters or digits (e.g. Arabic) fall back to `fallback`.
export function uniqueSlug(name: string, taken: Iterable<string>, fallback: string): string {
  const base = slugify(name).slice(0, 240) || fallback;
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_PATTERN.test(value);
