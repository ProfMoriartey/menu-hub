// src/lib/action-result.ts
import { unstable_rethrow } from "next/navigation";

// Server actions return their outcome instead of throwing: in production,
// Next.js replaces the message of any error thrown from a server action with
// a generic one, so a thrown "Slug already exists" never reaches the page.
export type ActionResult = { ok: true } | { ok: false; error: string };

// An error whose message is meant for the person using the page.
export class ActionError extends Error {}

/**
 * Runs a server action body and turns its outcome into an ActionResult.
 * ActionError messages are passed through; anything else is logged on the
 * server and replaced with `fallback`, so database details never leak.
 */
export async function runAction(
  fallback: string,
  body: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await body();
    return { ok: true };
  } catch (error) {
    // Let Next.js handle redirect() and notFound() as usual.
    unstable_rethrow(error);
    if (error instanceof ActionError) {
      return { ok: false, error: error.message };
    }
    console.error(fallback, error);
    return { ok: false, error: fallback };
  }
}

// For client code that already handles failures with try/catch: throws the
// action's error message in the browser, where it isn't hidden.
export function unwrap(result: ActionResult): void {
  if (!result.ok) throw new Error(result.error);
}
