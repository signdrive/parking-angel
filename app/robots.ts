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
          "/dashboard/",
          "/*.ico$", // Disallow crawling of icon files
          "/*.png$", // Disallow crawling of image assets
          "/*.jpg$", // Disallow crawling of image assets
          "/*.svg$", // Disallow crawling of SVG assets
          "/manifest.json", // Disallow crawling of PWA manifest
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
    sitemap: [
      "https://parkalgo.com/sitemap.xml",
      "https://parkalgo.com/blog/sitemap.xml"
    ],
    host: "https://parkalgo.com",
  }
}
