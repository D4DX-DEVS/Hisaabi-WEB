import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hisaabi",
    short_name: "Hisaabi",
    description: "Your all-in-one Muslim companion",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1a2a32",
    theme_color: "#1a2a32",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
