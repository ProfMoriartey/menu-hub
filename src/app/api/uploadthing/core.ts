// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
// NEW: Import auth from Clerk. This is the correct way to get user info in server-side contexts.
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// REMOVED: The 'fakeId' auth function. We will use Clerk's auth directly.
// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => { // Keep req here, but we won't use it directly for Clerk auth
      // This code runs on your server before upload
      // Use Clerk's auth() to get the userId
      const { userId } = await auth(); // Clerk's auth() is asynchronous, so it needs 'await' if used directly

      // If you throw, the user will not be able to upload
      // FIX: Throw an UploadThingError or a standard Error object
      if (!userId) throw new UploadThingError("Unauthorized"); // FIX: Throw Error object

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: userId }; // Return the actual Clerk userId
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      // FIX: Use file.url instead of file.ufsUrl. Uploadthing provides `file.url` for public access.
      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";

// const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// // FileRouter for your app, can contain multiple FileRoutes
// export const ourFileRouter = {
//   // Define as many FileRoutes as you like, each with a unique routeSlug
//   imageUploader: f({
//     image: {
//       /**
//        * For full list of options and defaults, see the File Route API reference
//        * @see https://docs.uploadthing.com/file-routes#route-config
//        */
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   })
//     // Set permissions and file types for this FileRoute
//     .middleware(async ({ req }) => {
//       // This code runs on your server before upload
//       const user = await auth(req);

//       // If you throw, the user will not be able to upload
//       if (!user) throw new UploadThingError("Unauthorized");

//       // Whatever is returned here is accessible in onUploadComplete as `metadata`
//       return { userId: user.id };
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       // This code RUNS ON YOUR SERVER after upload
//       console.log("Upload complete for userId:", metadata.userId);

//       console.log("file url", file.ufsUrl);

//       // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
//       return { uploadedBy: metadata.userId };
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;
