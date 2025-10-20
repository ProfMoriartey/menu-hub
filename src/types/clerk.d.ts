// src/types/clerk.d.ts

import '@clerk/nextjs/server'; // This line imports Clerk's types to extend them

declare module '@clerk/nextjs/server' {
  interface SessionClaims {
    // Add the 'metadata' property if it's missing (Clerk types may include it, 
    // but defining its structure ensures 'role' is known)
    metadata: {
      // Define your custom properties here
      role?: 'admin' | 'user' | string; // Specify possible values
    };
  }
}