// src/components/dashboard/RestaurantEditor.tsx
"use client";

import React, { useState } from "react";
import { cn } from "~/lib/utils"; // Assuming this utility exists
import type { Restaurant } from "~/types/restaurant";

// Placeholder components (now imported as TSX)
import RestaurantDetailsForm from "./RestaurantDetailsForm";
import CategoryManager from "./CategoryManager";

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
    // This check is mainly for development safety; layout should prevent null data
    return (
      <div className="py-10 text-center text-lg text-red-600">
        Error: No restaurant data loaded.
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col">
      <div className="sticky top-[64px] z-10 w-full border-b border-gray-200 bg-white p-4 shadow-sm">
        {/* Mobile Tab Select */}
        <label htmlFor="tab-select" className="sr-only">
          Select a page
        </label>
        <select
          id="tab-select"
          name="tab-select"
          className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:hidden"
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
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "details" | "categories")}
                className={cn(
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-150",
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 flex-grow p-4 sm:p-6">
        {activeTab === "details" && (
          <RestaurantDetailsForm restaurant={initialRestaurantData} />
        )}

        {activeTab === "categories" && (
          <CategoryManager
            restaurantId={initialRestaurantData.id}
            initialCategories={initialRestaurantData.categories}
          />
        )}
      </div>
    </div>
  );
}
