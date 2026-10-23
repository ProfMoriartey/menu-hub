// scripts/cleanup-uploads.mjs
//
// Finds UploadThing files that no restaurant (logo, share image) or menu item
// (photo) points to, and optionally deletes them.
//
//   npm run uploads:cleanup             # dry run: list what would be deleted
//   npm run uploads:cleanup -- --delete # delete them
//
// Options:
//   --delete              Actually delete. Without it nothing is changed.
//   --min-age-hours=24    Skip files newer than this, so an image uploaded into
//                         a form that hasn't been saved yet is left alone.
//   --force               Delete even if the database references none of the
//                         files (normally a sign DATABASE_URL is wrong).
//
// Reads DATABASE_URL and UPLOADTHING_TOKEN from .env. Run it against the
// database that belongs to this UploadThing app: pointed at another database,
// every file looks unused.

import postgres from "postgres";
import { UTApi } from "uploadthing/server";

const args = process.argv.slice(2);
const shouldDelete = args.includes("--delete");
const force = args.includes("--force");
const minAgeArg = args.find((a) => a.startsWith("--min-age-hours="));
const minAgeHours = minAgeArg ? Number(minAgeArg.split("=")[1]) : 24;

if (!Number.isFinite(minAgeHours) || minAgeHours < 0) {
  console.error("--min-age-hours must be a number of hours, e.g. --min-age-hours=24");
  process.exit(1);
}
for (const name of ["DATABASE_URL", "UPLOADTHING_TOKEN"]) {
  if (!process.env[name]) {
    console.error(`${name} is not set. Run with: node --env-file=.env scripts/cleanup-uploads.mjs`);
    process.exit(1);
  }
}

// Same rule as getUploadKey() in src/server/uploads.ts; keep them in step.
function getUploadKey(url) {
  if (!url) return null;
  try {
    const { hostname, pathname } = new URL(url);
    const isUploadThing = hostname === "utfs.io" || hostname.endsWith(".ufs.sh");
    const match = /^\/f\/([^/]+)$/.exec(pathname);
    return isUploadThing && match ? match[1] : null;
  } catch {
    return null;
  }
}

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function referencedKeys() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const rows = await sql`
      SELECT logo_url AS url FROM "menu-hub_restaurants"
      UNION ALL SELECT og_image FROM "menu-hub_restaurants"
      UNION ALL SELECT image_url FROM "menu-hub_menu_items"
    `;
    return new Set(rows.map((row) => getUploadKey(row.url)).filter(Boolean));
  } finally {
    await sql.end();
  }
}

async function allUploadedFiles(utapi) {
  const files = [];
  const limit = 500;
  for (let offset = 0; ; offset += limit) {
    const page = await utapi.listFiles({ limit, offset });
    files.push(...page.files);
    if (!page.hasMore || page.files.length === 0) return files;
  }
}

const utapi = new UTApi();
const [keysInUse, files] = await Promise.all([referencedKeys(), allUploadedFiles(utapi)]);

const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
const uploaded = files.filter((file) => file.status === "Uploaded");
const unused = uploaded.filter((file) => !keysInUse.has(file.key));
const tooNew = unused.filter((file) => file.uploadedAt > cutoff);
const orphans = unused.filter((file) => file.uploadedAt <= cutoff);

console.log(`UploadThing files:        ${files.length} (${uploaded.length} fully uploaded)`);
console.log(`Referenced in database:   ${keysInUse.size}`);
console.log(`Unused, newer than ${minAgeHours}h: ${tooNew.length} (kept)`);
console.log(`Unused, to delete:        ${orphans.length}`);

if (orphans.length === 0) {
  console.log("\nNothing to clean up.");
  process.exit(0);
}

console.log("");
for (const file of orphans) {
  const date = new Date(file.uploadedAt).toISOString().slice(0, 10);
  console.log(`  ${date}  ${formatSize(file.size).padStart(9)}  ${file.key}  (${file.name})`);
}
const totalSize = orphans.reduce((sum, file) => sum + file.size, 0);
console.log(`\n  ${orphans.length} files, ${formatSize(totalSize)}`);

if (!shouldDelete) {
  console.log("\nDry run: nothing was deleted. Re-run with --delete to remove these files.");
  process.exit(0);
}

const nothingReferenced = keysInUse.size === 0 || orphans.length === uploaded.length;
if (nothingReferenced && !force) {
  console.error(
    "\nRefusing to delete: the database references none of these files, which usually means " +
      "DATABASE_URL points at the wrong database. Check it, or add --force if this is really intended.",
  );
  process.exit(1);
}

const batchSize = 100;
let deleted = 0;
for (let i = 0; i < orphans.length; i += batchSize) {
  const keys = orphans.slice(i, i + batchSize).map((file) => file.key);
  const result = await utapi.deleteFiles(keys);
  deleted += result.deletedCount ?? keys.length;
}
console.log(`\nDeleted ${deleted} files.`);
