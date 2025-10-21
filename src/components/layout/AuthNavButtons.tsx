// src/components/layout/AuthNavButtons.tsx
"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "~/components/ui/button"; // Assuming Shadcn Button

export default function AuthNavButtons() {
  // NOTE: We don't need useUser() or useAuth() for this simple rendering logic.

  return (
    <div className="flex items-center space-x-2">
      {/* 1. Renders when the user is NOT signed in */}
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="secondary" className="text-sm font-medium">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>

      {/* 2. Renders when the user IS signed in */}
      <SignedIn>
        {/* The Dashboard link for the client user needs the Clerk User ID.
                  Since we are in a client component, we use the relative path 
                  and redirect to the correct user-specific route on the server.
                */}
        <Link href="/dashboard" passHref>
          <Button
            variant="default"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Dashboard
          </Button>
        </Link>
      </SignedIn>
    </div>
  );
}
