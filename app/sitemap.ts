import type { MetadataRoute } from "next";

const SITE_URL = "https://app.arcai.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/terms", "/support", "/download", "/changelog", "/sign-in", "/sign-up"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
