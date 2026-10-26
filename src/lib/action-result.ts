// src/lib/action-result.ts
// Shared by server actions and the pages that call them; nothing here may
// import server-only code. runAction() lives in ~/server/run-action.

// Every error a server action or upload can report, as a key under the
// ActionErrors namespace in src/messages/*.json. The server translates it
// into the visitor's language.
export const ACTION_ERROR_CODES = [
  // Fallbacks for unexpected failures
  "createRestaurantFailed",
  "saveRestaurantFailed",
  "deleteRestaurantFailed",
  "addCategoryFailed",
  "renameCategoryFailed",
  "deleteCategoryFailed",
  "addItemFailed",
  "saveItemFailed",
  "deleteItemFailed",
  "duplicateItemFailed",
  "reorderFailed",
  "grantAccessFailed",
  "removeAccessFailed",
  "deleteUserFailed",
  "createInviteFailed",
  "cancelInviteFailed",
  "respondInviteFailed",
  "saveLanguagesFailed",
  "saveTranslationsFailed",
  "saveHoursFailed",
  "saveColorFailed",
  // Access
  "signInAgain",
  "noAccess",
  "ownerOnly",
  "adminOnly",
  // Input
  "invalidInput",
  "slugInvalid",
  "slugTaken",
  "categoryNameRequired",
  "invalidOrder",
  "invalidItem",
  "unknownAccessLevel",
  "pickRestaurant",
  // Missing things
  "missingRestaurant",
  "restaurantNotFound",
  "categoryNotFound",
  "invalidCategory",
  "itemNotFound",
  "missingUser",
  // Users
  "cantDeleteSelf",
  "cantDeleteAdmin",
  // Team and invitations
  "invalidEmail",
  "alreadyMember",
  "tooManyInvites",
  "inviteInvalid",
  "inviteWrongAccount",
  "memberNotFound",
  "ownersByAdminOnly",
  "ownerCantLeave",
  // Menu languages
  "multilingualOff",
  "invalidLanguages",
  // Opening hours and brand colour
  "invalidHours",
  "invalidTimeZone",
  "invalidColor",
  "brandColorOff",
  // Uploads
  "signInToUpload",
  "adminOnlyNewLogo",
  "ownerOnlyLogo",
] as const;

export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];

export type ActionErrorValues = Record<string, string | number>;

// Server actions return their outcome instead of throwing: in production,
// Next.js replaces the message of any error thrown from a server action with
// a generic one, so a thrown error never reaches the page. `error` is
// already translated; `code` lets a page react to a specific failure.
// Most actions return nothing on success; some (e.g. duplicating an item)
// hand back what they made as `data`.
export type ActionResult<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string; code: ActionErrorCode };

// An error meant for the person using the page. runAction() turns it into a
// translated message.
export class ActionError extends Error {
  constructor(
    readonly code: ActionErrorCode,
    readonly values?: ActionErrorValues,
  ) {
    super(code);
  }
}

// What unwrap() throws in the browser: the translated message, plus the code.
export class ActionFailure extends Error {
  constructor(
    message: string,
    readonly code: ActionErrorCode,
  ) {
    super(message);
  }
}

// For client code that already handles failures with try/catch.
export function unwrap<T>(result: ActionResult<T>): void {
  if (!result.ok) throw new ActionFailure(result.error, result.code);
}
