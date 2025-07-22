import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/private/",
          "/auth/callback",
          "/dashboard/settings/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "Google-Extended", 
        disallow: "/",
      },
    ],
    sitemap: "https://www.parkalgo.com/sitemap.xml",
  }
}
