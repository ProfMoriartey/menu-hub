import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Menupedia",
    short_name: "Menupedia",
    description: "The Smart Way to Share Menus",
    start_url: "/",
    display: "browser",
    background_color: "#FCF9F4",
    theme_color: "#9B1C2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
