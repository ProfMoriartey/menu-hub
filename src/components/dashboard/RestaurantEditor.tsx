"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

// Placeholder components
import RestaurantDetailsForm from "./RestaurantDetailsForm";
import CategoryManager from "./CategoryManager";
import { ThemeToggle } from "../shared/ThemeToggle";

// Local component to replace next/link
const CustomLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={href} className={className}>
    {children}
  </a>
);

interface RestaurantEditorProps {
  initialRestaurantData: Restaurant;
}

// --- TAB DATA ---
const tabs = [
  { id: "details", name: "Restaurant Details" },
  { id: "categories", name: "Categories & Items" },
];

// --- MAIN COMPONENT ---
export default function RestaurantEditor({
  initialRestaurantData,
}: RestaurantEditorProps) {
  const [activeTab, setActiveTab] = useState<"details" | "categories">(
    "details",
  );

  if (!initialRestaurantData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="p-6">
          <CardTitle className="mb-3 text-xl">Error Loading Menu</CardTitle>
          <CardContent>
            <p className="text-red-600">
              Error: No restaurant data loaded or assigned.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const restaurantName = initialRestaurantData.name;

  return (
    <div className="container mx-auto flex min-h-[80vh] flex-col px-4 py-8">
      {/* HEADER SECTION: Title and Back Button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="mb-4 truncate text-4xl font-extrabold tracking-tight sm:mb-0">
          Editing:{" "}
          {/* Note: Colors like text-indigo-600 are intentional brand/accent colors and should remain fixed. */}
          <span className="text-primary">{restaurantName}</span>
        </h1>

        <div className="flex justify-between gap-4">
          <CustomLink href="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </CustomLink>
          <ThemeToggle />
        </div>
      </div>

      {/* TAB NAVIGATION SECTION */}
      <div className="border-border mb-6 border-b">
        {" "}
        {/* Used border-border */}
        {/* Mobile Tab Select */}
        <label htmlFor="tab-select" className="sr-only">
          Select a page
        </label>
        <select
          id="tab-select"
          name="tab-select"
          // Switched fixed colors to semantic colors
          className="border-input bg-background focus:border-primary focus:ring-primary mb-4 block w-full rounded-md border py-2 pr-10 pl-3 text-sm sm:hidden"
          value={activeTab}
          onChange={(e) =>
            setActiveTab(e.target.value as "details" | "categories")
          }
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
        {/* Desktop Tab Navigation */}
        <nav className="-mb-px hidden space-x-8 sm:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "details" | "categories")}
              className={cn(
                activeTab === tab.id
                  ? // Uses text-primary for active state (indigo)
                    "border-primary text-primary"
                  : // Uses text-muted-foreground and hover:text-foreground
                    "text-muted-foreground hover:border-border hover:text-foreground border-transparent",
                "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-150",
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA: Wrapped in a Card for Dashboard Consistency */}
      <div className="flex-grow">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {tabs.find((t) => t.id === activeTab)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTab === "details" && (
              <RestaurantDetailsForm restaurant={initialRestaurantData} />
            )}

            {activeTab === "categories" && (
              <CategoryManager
                restaurantId={initialRestaurantData.id}
                initialCategories={initialRestaurantData.categories}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
