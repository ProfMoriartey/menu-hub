// src/components/dashboard/RestaurantEditor.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link"; // 🛑 Import Link for navigation
import { ChevronLeft } from "lucide-react"; // 🛑 Import icon
import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";

// Placeholder components
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
    return (
      <div className="py-10 text-center text-lg text-red-600">
        Error: No restaurant data loaded.
      </div>
    );
  }

  const restaurantName = initialRestaurantData.name;

  return (
    <div className="flex min-h-[80vh] flex-col">
      {/* STICKY HEADER FOR CONTEXT AND NAVIGATION */}
      <div className="sticky top-0 z-10 mb-3 w-full border-b border-gray-200 bg-white shadow-md">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* 🛑 TITLE AND BUTTON ROW */}
          <div className="flex items-center justify-between pt-4 pb-2">
            <div className="flex items-center justify-between space-x-3">
              {/* Back Button */}
              <Link
                href="/dashboard" // Links to the main user dashboard list
                className="inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>

              {/* Title for context */}
              <h1 className="truncate text-xl font-bold text-gray-800 sm:text-2xl">
                Editing:{" "}
                <span className="text-indigo-600">{restaurantName}</span>
              </h1>
            </div>
          </div>

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
          <div className="mt-2 hidden border-t border-gray-100 sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "details" | "categories")
                  }
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
      </div>

      {/* Main Content Area */}
      <div className="flex-grow px-4 pt-6 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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
    </div>
  );
}
