// scripts/shrink-photos.mjs
//
// Finds menu item photos uploaded before photos were shrunk in the browser
// (src/lib/resize-image.ts): camera-sized files that make the first view of
// each photo slow. Makes a smaller copy of each, the way the browser would
// now (longest side 1600 px, WebP), uploads it and points the database at it.
//
//   pnpm uploads:shrink                          # dry run: list what would change
//   pnpm uploads:shrink -- --restaurant=fluburger
//   pnpm uploads:shrink -- --apply               # do it
//
// Options:
//   --apply               Upload the smaller copies and update the database.
//                         Without it nothing is changed.
//   --restaurant=<slug>   Only this restaurant's photos.
//   --min-kb=300          Leave photos at or below this size alone, unless
//                         they're bigger than --max-size pixels.
//   --max-size=1600       Longest side after shrinking, in pixels.
//
// The old files are kept: cached menu pages still point at them for up to
// an hour. Delete them afterwards with `pnpm uploads:cleanup` (they're no
// longer referenced).
//
// Reads DATABASE_URL and UPLOADTHING_TOKEN from .env.

import postgres from "postgres";
import sharp from "sharp";
import { UTApi, UTFile } from "uploadthing/server";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
};
const apply = args.includes("--apply");
const restaurantSlug = option("restaurant", null);
const minBytes = Number(option("min-kb", "300")) * 1024;
const maxSize = Number(option("max-size", "1600"));
// As ITEM_PHOTO in src/lib/resize-image.ts.
const QUALITY = 82;
// A copy that saves less than this isn't worth swapping in.
const MIN_SAVING = 0.2;
const CONCURRENCY = 4;

if (!Number.isFinite(minBytes) || minBytes < 0 || !Number.isInteger(maxSize) || maxSize < 200) {
  console.error("--min-kb must be a number of KB and --max-size a number of pixels (200 or more).");
  process.exit(1);
}
for (const name of ["DATABASE_URL", "UPLOADTHING_TOKEN"]) {
  if (!process.env[name]) {
    console.error(`${name} is not set. Run with: node --env-file=.env scripts/shrink-photos.mjs`);
    process.exit(1);
  }
}

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Runs `work` over `items`, a few at a time.
async function pool(items, work) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await work(items[i]);
      }
    }),
  );
  return results;
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const rows = await sql`
    SELECT r.slug, i.name, i.image_url AS url
    FROM "menu-hub_menu_items" i
    JOIN "menu-hub_restaurants" r ON r.id = i.restaurant_id
    WHERE i.image_url IS NOT NULL
      ${restaurantSlug ? sql`AND r.slug = ${restaurantSlug}` : sql``}
    ORDER BY r.slug, i.name
  `;
  if (restaurantSlug && rows.length === 0) {
    console.log(`No photos found for restaurant "${restaurantSlug}".`);
    process.exit(0);
  }

  // Dishes can share a photo: each file is shrunk once.
  const byUrl = new Map();
  for (const row of rows) {
    const entry = byUrl.get(row.url) ?? { url: row.url, uses: [] };
    entry.uses.push(`${row.slug}: ${row.name}`);
    byUrl.set(row.url, entry);
  }
  console.log(`Checking ${byUrl.size} photos (${rows.length} dishes)…\n`);

  const checked = await pool([...byUrl.values()], async (entry) => {
    try {
      const response = await fetch(entry.url);
      if (!response.ok) return { ...entry, error: `download failed (${response.status})` };
      const original = Buffer.from(await response.arrayBuffer());
      const meta = await sharp(original).metadata();
      const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
      const before = { bytes: original.length, width: meta.width, height: meta.height };
      if (original.length <= minBytes && longest <= maxSize) return { ...entry, before, skip: "already small" };
      // Animated images would lose their animation.
      if ((meta.pages ?? 1) > 1) return { ...entry, before, skip: "animated" };

      // rotate() applies the EXIF orientation, so the copy isn't sideways.
      const { data, info } = await sharp(original)
        .rotate()
        .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer({ resolveWithObject: true });
      const after = { bytes: data.length, width: info.width, height: info.height };
      if (data.length > original.length * (1 - MIN_SAVING)) return { ...entry, before, after, skip: "little to gain" };
      return { ...entry, before, after, data };
    } catch (error) {
      return { ...entry, error: error instanceof Error ? error.message : String(error) };
    }
  });

  const toShrink = checked.filter((c) => c.data);
  for (const c of checked) {
    const label = c.uses.length > 1 ? `${c.uses[0]} (+${c.uses.length - 1} more)` : c.uses[0];
    if (c.error) console.log(`  !  ${label}: ${c.error}`);
    else if (c.data)
      console.log(
        `  -> ${label}: ${formatSize(c.before.bytes)} ${c.before.width}x${c.before.height}` +
          `  =>  ${formatSize(c.after.bytes)} ${c.after.width}x${c.after.height}`,
      );
  }
  const skipped = checked.filter((c) => c.skip).length;
  const failed = checked.filter((c) => c.error).length;
  const saved = toShrink.reduce((sum, c) => sum + c.before.bytes - c.after.bytes, 0);
  console.log(
    `\n${toShrink.length} to shrink (saving ${formatSize(saved)}), ${skipped} fine as they are` +
      (failed ? `, ${failed} couldn't be checked` : "") +
      ".",
  );

  if (toShrink.length === 0) process.exit(0);
  if (!apply) {
    console.log("\nDry run: nothing was changed. Re-run with --apply to shrink these photos.");
    process.exit(0);
  }

  const utapi = new UTApi();
  let done = 0;
  for (const c of toShrink) {
    const name = `${(c.uses[0].split(": ")[1] ?? "photo").replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60) || "photo"}.webp`;
    const upload = await utapi.uploadFiles(new UTFile([c.data], name, { type: "image/webp" }));
    const newUrl = upload.data?.ufsUrl;
    if (!newUrl) {
      console.log(`  !  ${c.uses[0]}: upload failed (${upload.error?.message ?? "no URL"}), left as it was`);
      continue;
    }
    // Every row using the old file, including a restaurant's share image.
    await sql.begin(async (tx) => {
      await tx`UPDATE "menu-hub_menu_items" SET image_url = ${newUrl}, updated_at = now() WHERE image_url = ${c.url}`;
      await tx`UPDATE "menu-hub_restaurants" SET og_image = ${newUrl} WHERE og_image = ${c.url}`;
    });
    done++;
    console.log(`  ok ${c.uses[0]}`);
  }
  console.log(
    `\nShrank ${done} of ${toShrink.length} photos. Menus show them within an hour (or at once after any edit ` +
      "to the restaurant). After that, `pnpm uploads:cleanup -- --delete` removes the old files.",
  );
} finally {
  await sql.end();
}
