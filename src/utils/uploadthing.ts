import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// The look of every UploadButton: a solid primary button, so it stands out
// on cards and dialogs in both themes. The progress bar is the button's
// ::after, drawn lighter on top while uploading.
export const uploadButtonClass = [
  "ut-button:inline-flex ut-button:h-9 ut-button:cursor-pointer ut-button:items-center ut-button:justify-center",
  "ut-button:rounded-md ut-button:px-4 ut-button:text-sm ut-button:font-medium ut-button:shadow-xs",
  "ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90",
  "ut-button:focus-within:ring-ring/50 ut-button:focus-within:ring-[3px]",
  "ut-button:after:bg-primary-foreground/25",
  "ut-readying:ut-button:opacity-60 ut-uploading:ut-button:cursor-wait",
].join(" ");
