// src/server/uploads.ts
import { sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";

const utapi = new UTApi();

// UploadThing file URLs look like https://utfs.io/f/<key> (legacy) or
// https://<app>.ufs.sh/f/<key>. Anything else isn't ours to delete.
export function getUploadKey(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { hostname, pathname } = new URL(url);
    const isUploadThing = hostname === "utfs.io" || hostname.endsWith(".ufs.sh");
    const match = /^\/f\/([^/]+)$/.exec(pathname);
    return isUploadThing && match ? match[1]! : null;
  } catch {
    return null;
  }
}

// URLs from the list that a restaurant or menu item still uses. A duplicated
// item shares its original's photo, so a file can belong to several rows.
async function stillReferenced(urls: string[]): Promise<Set<string>> {
  const rows = await db.execute<{ url: string }>(sql`
    SELECT logo_url AS url FROM ${restaurants} WHERE logo_url IN ${urls}
    UNION SELECT og_image FROM ${restaurants} WHERE og_image IN ${urls}
    UNION SELECT image_url FROM ${menuItems} WHERE image_url IN ${urls}
  `);
  return new Set(rows.map((row) => row.url));
}

/**
 * Deletes the UploadThing files behind these URLs, except ones another
 * restaurant or item still uses. Best effort: call it after the database
 * change, and a failed cleanup is logged rather than failing it.
 */
export async function deleteUploadedFiles(urls: (string | null | undefined)[]): Promise<void> {
  const candidates = [...new Set(urls.filter((url): url is string => getUploadKey(url) !== null))];
  if (candidates.length === 0) return;

  try {
    const inUse = await stillReferenced(candidates);
    const keys = candidates.filter((url) => !inUse.has(url)).map((url) => getUploadKey(url)!);
    if (keys.length > 0) await utapi.deleteFiles(keys);
  } catch (error) {
    console.error("Failed to delete uploaded files:", candidates, error);
  }
}
