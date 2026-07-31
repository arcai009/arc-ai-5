import type { MetadataRoute } from "next";

const SITE_URL = "https://app.arcai.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/chat", "/agent", "/billing", "/settings", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
