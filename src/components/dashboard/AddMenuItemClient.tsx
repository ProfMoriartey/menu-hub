"use client";

import React, { useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl"; // Import next-intl hook
import { addMenuItem } from "~/app/actions/menu-item";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button"; // Use Shadcn Button
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import Image from "next/image";

// Local component to replace next/image
const CustomImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={{ width: "100%", height: "100%" }}
  />
);

// NOTE: Assuming DietaryLabel and ALL_DIETARY_LABELS are defined elsewhere
type DietaryLabel = string;
const ALL_DIETARY_LABELS: DietaryLabel[] = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "nut-free",
];

// --- TYPE DEFINITIONS ---

interface FormState {
  message: string;
  success: boolean;
}

const initialState: FormState = {
  message: "",
  success: false,
};

interface AddMenuItemFormProps {
  restaurantId: string;
  categoryId: string;
  onSuccess: () => void;
}

interface SubmitButtonProps {
  label: string;
}

// --- Submit Button Component (Uses Shadcn Button and i18n label) ---
function SubmitButton({ label }: SubmitButtonProps) {
  const t = useTranslations("MenuItemManager.addForm"); // Access manager translations
  const { pending } = useFormStatus();

  // Use the translation for "Processing..." or the default label
  const buttonLabel = pending ? t("processing") : label;

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant="default" // Theme-aware primary button
      className="w-full sm:w-auto"
    >
      {buttonLabel}
    </Button>
  );
}

// --- Wrapper Action ---
async function wrapAddAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const imageUrl = (formData.get("image-url-state") as string) || "";
  const dietaryLabelsJson =
    (formData.get("dietary-labels-state") as string) || "[]";

  formData.set("imageUrl", imageUrl);
  formData.set("dietaryLabels", dietaryLabelsJson);

  try {
    await addMenuItem(formData);
    // Use fixed success key for server action success message
    return { message: "addSuccess", success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "addUnknownError";
    // Use fixed error key for server action failure message
    return { message: `addFailedPrefix: ${message}`, success: false };
  }
}

// --- Main Component ---
export function AddMenuItemClient({
  restaurantId,
  categoryId,
  onSuccess,
}: AddMenuItemFormProps) {
  const t = useTranslations("MenuItemManager.addForm"); // Localize component strings

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >([]);

  const [state, formAction] = useFormState(wrapAddAction, initialState);

  // Reset form after successful submission
  React.useEffect(() => {
    if (state.success) {
      setImageUrl(null);
      setSelectedDietaryLabels([]);
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleDietaryLabelChange = (label: DietaryLabel, checked: boolean) => {
    setSelectedDietaryLabels((prevLabels) => {
      if (checked) {
        return [...prevLabels, label];
      } else {
        return prevLabels.filter((l) => l !== label);
      }
    });
  };

  // Utility function to format labels (e.g., gluten-free -> Gluten Free)
  const formatLabel = (label: DietaryLabel) =>
    (label.charAt(0).toUpperCase() + label.slice(1)).replace(/-/g, " ");

  return (
    // Replaced fixed green colors with theme-aware border/background
    <div className="border-border bg-card rounded-xl border p-6 shadow-md">
      <h4 className="text-foreground mb-4 text-lg font-semibold">
        {t("newTitle")}
      </h4>

      {state.message && (
        <div
          // Use semantic colors for success/error backgrounds
          className={cn(
            "mb-4 rounded p-3 text-sm",
            state.success
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {/* Use translation key for status messages */}
          {state.success
            ? t(state.message)
            : `${t("addFailedPrefix")} ${state.message}`}
        </div>
      )}

      {/* The form must be a standalone unit */}
      <form action={formAction} className="space-y-6">
        {" "}
        {/* Consistent space-y-6 */}
        <input type="hidden" name="restaurantId" defaultValue={restaurantId} />
        <input type="hidden" name="categoryId" defaultValue={categoryId} />
        {/* Hidden inputs to pass state-controlled values to the Server Action */}
        <input type="hidden" name="image-url-state" value={imageUrl ?? ""} />
        <input
          type="hidden"
          name="dietary-labels-state"
          value={JSON.stringify(selectedDietaryLabels)}
        />
        {/* Form Fields - Use placeholders from translations */}
        <Input
          type="text"
          name="name"
          required
          placeholder={t("placeholderName")}
        />
        <Input
          type="text"
          name="price"
          required
          placeholder={t("placeholderPrice")}
        />
        <Textarea
          name="description"
          rows={2}
          placeholder={t("placeholderDescription")}
        />
        <Textarea
          name="ingredients"
          rows={1}
          placeholder={t("placeholderIngredients")}
        />
        {/* Dietary Labels */}
        <div>
          <Label className="text-foreground mb-2 block text-sm font-medium">
            {t("labelDietaryLabels")}
          </Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {ALL_DIETARY_LABELS.map((label) => (
              <div key={label} className="flex items-center space-x-2">
                <Checkbox
                  id={`add-dietary-${label}`}
                  checked={selectedDietaryLabels.includes(label)}
                  onCheckedChange={(checked) =>
                    handleDietaryLabelChange(label, !!checked)
                  }
                />
                <Label
                  htmlFor={`add-dietary-${label}`}
                  className="text-muted-foreground text-sm"
                >
                  {/* Localized label for display */}
                  {t(`dietaryLabels.${label}`)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        {/* Image Upload */}
        <div className="border-border space-y-2 border-t pt-4">
          {" "}
          {/* Theme-aware border */}
          <Label className="text-foreground block text-sm font-medium">
            {t("labelItemImage")}
          </Label>
          {imageUrl && (
            <div className="border-border relative h-24 w-24 overflow-hidden rounded-md border">
              <Image
                src={imageUrl}
                alt={t("imagePreviewAlt")}
                width={96}
                height={96}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                // Use theme-aware destructive button for deleting image
                className="bg-destructive/80 hover:bg-destructive text-destructive-foreground absolute top-0 right-0 rounded-bl-lg p-1 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            // Apply UploadThing semantic theme overrides
            className={cn(
              "ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground",
              "ut-allowed-content:text-muted-foreground",
              "ut-container:border-border ut-container:hover:bg-accent/10",
              "ut-readying:bg-muted ut-readying:text-muted-foreground",
              "ut-label:text-foreground",
            )}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                setImageUrl(res[0].url);
              }
            }}
            onUploadError={(error: Error) =>
              console.error(`Upload ERROR: ${error.message}`)
            }
          />
        </div>
        <div className="flex justify-end pt-4">
          <SubmitButton label={t("createItemButton")} />
        </div>
      </form>
    </div>
  );
}
