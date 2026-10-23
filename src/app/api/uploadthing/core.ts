// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { hasLocale } from "next-intl";
import { getRestaurantRole, isSystemAdmin } from "~/app/actions/auth";
import { canEditDetails } from "~/lib/access";
import type { ActionErrorCode } from "~/lib/action-result";
import { routing } from "~/i18n/routing";
import { translateActionError } from "~/server/run-action";

const f = createUploadthing();

// Upload buttons send the page's language: /api routes skip the next-intl
// middleware, so the request alone doesn't say which language to answer in.
const localeInput = z.string().optional();

// Only UploadThingError messages reach the browser; anything else becomes
// "Failed to run middleware". It is an Error subclass the lint rule can't see.
async function deny(code: ActionErrorCode, locale: string | undefined): Promise<never> {
  const known = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const message = await translateActionError(code, undefined, known);
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new UploadThingError(message);
}

// Uploads go to our UploadThing account, so they follow the same rules as
// the edits they're for. Each upload button sends the restaurant it's for.
async function requireSignedIn(locale: string | undefined) {
  const { userId } = await auth();
  if (!userId) return deny("signInToUpload", locale);
  return userId;
}

export const ourFileRouter = {
  // Logos are restaurant details: owners and admins. Without a restaurant
  // (the admin "new restaurant" form) only admins may upload.
  logoUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ restaurantId: z.string().uuid().optional(), locale: localeInput }))
    .middleware(async ({ input }) => {
      const userId = await requireSignedIn(input.locale);

      if (!input.restaurantId) {
        if (!(await isSystemAdmin())) await deny("adminOnlyNewLogo", input.locale);
        return { userId };
      }

      if (!canEditDetails(await getRestaurantRole(input.restaurantId))) {
        await deny("ownerOnlyLogo", input.locale);
      }
      return { userId, restaurantId: input.restaurantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Logo upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Menu item photos: anyone who can edit the restaurant's menu.
  imageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .input(z.object({ restaurantId: z.string().uuid(), locale: localeInput }))
    .middleware(async ({ input }) => {
      const userId = await requireSignedIn(input.locale);
      if (!(await getRestaurantRole(input.restaurantId))) {
        await deny("noAccess", input.locale);
      }
      return { userId, restaurantId: input.restaurantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Menu item image upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
