// src/server/run-action.ts
import { unstable_rethrow } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ActionError,
  type ActionErrorCode,
  type ActionErrorValues,
  type ActionResult,
} from "~/lib/action-result";

/** An action error's message in the language of the current request. */
export async function translateActionError(
  code: ActionErrorCode,
  values?: ActionErrorValues,
  locale?: string,
): Promise<string> {
  // Without an explicit locale, next-intl uses the current request's.
  const t = locale
    ? await getTranslations({ locale, namespace: "ActionErrors" })
    : await getTranslations("ActionErrors");
  return t(code, values);
}

/**
 * Runs a server action body and turns its outcome into an ActionResult.
 * ActionErrors become translated messages; anything else is logged on the
 * server and reported as `fallback`, so database details never leak.
 */
export async function runAction<T = void>(
  fallback: ActionErrorCode,
  body: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await body();
    // Actions without a result keep returning just { ok: true }.
    return (data === undefined ? { ok: true } : { ok: true, data }) as ActionResult<T>;
  } catch (error) {
    // Let Next.js handle redirect() and notFound() as usual.
    unstable_rethrow(error);
    if (error instanceof ActionError) {
      return { ok: false, code: error.code, error: await translateActionError(error.code, error.values) };
    }
    console.error(fallback, error);
    return { ok: false, code: fallback, error: await translateActionError(fallback) };
  }
}
