// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getRestaurantRole, isSystemAdmin } from "~/app/actions/auth";
import { canEditDetails } from "~/lib/access";

const f = createUploadthing();

// Uploads go to our UploadThing account, so they follow the same rules as
// the edits they're for. Each upload button sends the restaurant it's for.
// Only UploadThingError messages reach the browser; anything else becomes
// "Failed to run middleware". It is an Error subclass the lint rule can't see.
function deny(message: string): never {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new UploadThingError(message);
}

async function requireSignedIn() {
  const { userId } = await auth();
  if (!userId) deny("Please sign in to upload files.");
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
    .input(z.object({ restaurantId: z.string().uuid().optional() }))
    .middleware(async ({ input }) => {
      const userId = await requireSignedIn();

      if (!input.restaurantId) {
        if (!(await isSystemAdmin())) {
          deny("Only administrators can upload a logo for a new restaurant.");
        }
        return { userId };
      }

      if (!canEditDetails(await getRestaurantRole(input.restaurantId))) {
        deny("Only the restaurant's owner can change its logo.");
      }
      return { userId, restaurantId: input.restaurantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Logo upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),

  // Menu item photos: anyone who can edit the restaurant's menu.
  imageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .input(z.object({ restaurantId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const userId = await requireSignedIn();
      if (!(await getRestaurantRole(input.restaurantId))) {
        deny("You don't have access to this restaurant.");
      }
      return { userId, restaurantId: input.restaurantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Menu item image upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
