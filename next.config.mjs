import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No `output: 'export'`: the admin dashboard needs middleware, server actions
  // and route handlers, so the site must run on a Node host (e.g. Vercel).
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Lets a test build write somewhere other than .next (NEXT_DIST_DIR=.next-check)
  // so it doesn't wipe the files a running `npm run dev` is serving.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // This folder is the project root (there are stray lockfiles in parent folders).
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  poweredByHeader: false,
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Nothing on this site is meant to be shown inside another site's frame.
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/:path*", headers: common },
      // Keep the admin out of search results.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
