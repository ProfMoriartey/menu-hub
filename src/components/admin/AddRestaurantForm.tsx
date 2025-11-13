"use client";

import { useRef, useState, useEffect } from "react"; // ADDED useEffect
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useFormStatus } from "react-dom";
import { cn } from "~/lib/utils";
import { useTranslations } from "next-intl"; // Import for i18n
import { restaurantSchema } from "~/lib/schemas";
import { RestaurantForm } from "~/components/admin/RestaurantForm";

interface AddRestaurantFormProps {
  addRestaurantAction: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const t = useTranslations("AdminRestaurants");
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("bg-primary text-primary-foreground hover:bg-primary/90")}
    >
      {pending ? "Adding..." : "Add Restaurant"}
    </Button>
  );
}

export function AddRestaurantForm({
  addRestaurantAction,
}: AddRestaurantFormProps) {
  const t = useTranslations("AdminRestaurants");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 🛑 FIX: INTRODUCE STATE FOR NAME AND COUNTRY
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantCountry, setNewRestaurantCountry] = useState("");

  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true);
  const [isNewRestaurantDisplayed, setIsNewRestaurantDisplayed] =
    useState(true);
  const [newRestaurantLogoUrl, setNewRestaurantLogoUrl] = useState<
    string | null
  >(null);

  const [newRestaurantCurrency, setNewRestaurantCurrency] = useState("USD");
  const [newRestaurantPhoneNumber, setNewRestaurantPhoneNumber] = useState("");
  const [newRestaurantDescription, setNewRestaurantDescription] = useState("");
  const [newRestaurantTheme, setNewRestaurantTheme] = useState("");
  const [
    newRestaurantTypeOfEstablishment,
    setNewRestaurantTypeOfEstablishment,
  ] = useState("");

  const addFormRef = useRef<HTMLFormElement>(null);

  // Clear generic errors when the dialog is closed (UX improvement)
  useEffect(() => {
    if (!isAddDialogOpen) {
      setFormErrors({});
      // Also reset state values when the dialog is closed without success,
      // though successful submission handles reset too.
    }
  }, [isAddDialogOpen]);

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    // 🛑 FIX: Inject the controlled Name and Country fields
    formData.set("name", newRestaurantName);
    formData.set("country", newRestaurantCountry);

    // Inject all other controlled state values
    formData.set("isActive", isNewRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isNewRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", newRestaurantLogoUrl ?? "");
    formData.set("currency", newRestaurantCurrency);
    formData.set("phoneNumber", newRestaurantPhoneNumber);
    formData.set("description", newRestaurantDescription);
    formData.set("theme", newRestaurantTheme);
    formData.set("typeOfEstablishment", newRestaurantTypeOfEstablishment);

    const values = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string,
      isDisplayed: formData.get("isDisplayed") as string | null,
      logoUrl: formData.get("logoUrl") as string | null,
      currency: formData.get("currency") as string,
      phoneNumber: formData.get("phoneNumber") as string | null,
      description: formData.get("description") as string | null,
      theme: formData.get("theme") as string | null,
      typeOfEstablishment: formData.get("typeOfEstablishment") as string | null,
    };

    const result = restaurantSchema.safeParse(values);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((_e) => {
        const key =
          Array.isArray(_e.path) && typeof _e.path[0] === "string"
            ? _e.path[0]
            : "general";
        errors[key] = _e.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});

      // 🛑 FIX: Reset all states after success
      setNewRestaurantName("");
      setNewRestaurantCountry("");
      setIsNewRestaurantActive(true);
      setIsNewRestaurantDisplayed(true);
      setNewRestaurantLogoUrl(null);
      setNewRestaurantCurrency("USD");
      setNewRestaurantPhoneNumber("");
      setNewRestaurantDescription("");
      setNewRestaurantTheme("");
      setNewRestaurantTypeOfEstablishment("");
    } catch (error) {
      setFormErrors({
        general:
          error instanceof Error ? error.message : t("addForm.addFailed"),
      });
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "w-full md:w-1/3",
            "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          Add New Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new restaurant.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={addFormRef}
          action={handleAddSubmit}
          className="grid gap-4 py-4"
        >
          {/* NOTE: You need to ensure the RestaurantForm component uses these props for its inputs */}
          <RestaurantForm
            formErrors={formErrors}
            // 🛑 FIX: PASS NEW CONTROLLED STATE AND HANDLERS
            currentName={newRestaurantName}
            onNameChange={setNewRestaurantName}
            currentCountry={newRestaurantCountry}
            onCountryChange={setNewRestaurantCountry}
            onLogoUrlChange={setNewRestaurantLogoUrl}
            onIsActiveChange={setIsNewRestaurantActive}
            onIsDisplayedChange={setIsNewRestaurantDisplayed}
            currentIsActive={isNewRestaurantActive}
            currentIsDisplayed={isNewRestaurantDisplayed}
            currentLogoUrl={newRestaurantLogoUrl}
            currentCurrency={newRestaurantCurrency}
            onCurrencyChange={setNewRestaurantCurrency}
            currentPhoneNumber={newRestaurantPhoneNumber}
            onPhoneNumberChange={setNewRestaurantPhoneNumber}
            currentDescription={newRestaurantDescription}
            onDescriptionChange={setNewRestaurantDescription}
            currentTheme={newRestaurantTheme}
            onThemeChange={setNewRestaurantTheme}
            currentTypeOfEstablishment={newRestaurantTypeOfEstablishment}
            onTypeOfEstablishmentChange={setNewRestaurantTypeOfEstablishment}
          />

          {formErrors.general && (
            <p className="text-destructive col-span-full mt-4 text-center text-sm">
              {formErrors.general}
            </p>
          )}

          <DialogFooter className="col-span-full">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
