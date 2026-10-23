// src/server/uploads.ts
import { UTApi } from "uploadthing/server";

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

/**
 * Deletes the UploadThing files behind these URLs. Best effort: call it after
 * the database change, and a failed cleanup is logged rather than failing it.
 */
export async function deleteUploadedFiles(urls: (string | null | undefined)[]): Promise<void> {
  const keys = [...new Set(urls.map(getUploadKey).filter((key): key is string => key !== null))];
  if (keys.length === 0) return;
  try {
    await utapi.deleteFiles(keys);
  } catch (error) {
    console.error("Failed to delete uploaded files:", keys, error);
  }
}
