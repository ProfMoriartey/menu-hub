"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ShoppingBag, ExternalLink } from "lucide-react";
import type { DeliveryAppLinks } from "~/lib/schemas";

interface DeliveryOptionsDialogProps {
  deliveryApps: DeliveryAppLinks;
  restaurantName: string;
  buttonLabel: string;
}

export function DeliveryOptionsDialog({
  deliveryApps,
  restaurantName,
  buttonLabel,
}: DeliveryOptionsDialogProps) {
  // Filter out empty or undefined links
  const availableApps = Object.entries(deliveryApps).filter(
    ([_, url]) => url && url.trim() !== ""
  );

  if (availableApps.length === 0) return null;

  // Helper to format the key into a readable name
  const formatName = (key: string) => {
    const names: Record<string, string> = {
      yemeksepeti: "Yemeksepeti",
      getir: "Getir",
      trendyolYemek: "Trendyol Yemek",
      migrosYemek: "Migros Yemek",
      uberEats: "UberEats",
      deliveroo: "Deliveroo",
    };
    return names[key] || key;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto font-bold" size="lg">
          <ShoppingBag className="mr-2 h-5 w-5" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order from {restaurantName}</DialogTitle>
          <DialogDescription>
            Choose your preferred delivery platform below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 py-4">
          {availableApps.map(([key, url]) => (
            <Button
              key={key}
              variant="outline"
              className="w-full justify-between h-14 text-lg"
              asChild
            >
              <a href={url as string} target="_blank" rel="noopener noreferrer">
                {formatName(key)}
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}