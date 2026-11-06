import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name}`,
    short_name: site.firstName,
    description: site.summary,
    start_url: "/",
    display: "standalone",
    background_color: "#edeae2",
    theme_color: "#edeae2",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
