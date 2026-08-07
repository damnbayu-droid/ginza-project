import type { MetadataRoute } from "next";

const BASE_URL = "https://mongondowpedia.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/akun",
          "/api/",
          "/verifikator",
          "/auth",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
