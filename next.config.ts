import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const protectedHeaders = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    return [
      { source: "/preparar", headers: protectedHeaders },
      { source: "/api/private/:path*", headers: protectedHeaders },
      { source: "/api/surprises/:path*", headers: protectedHeaders },
    ];
  },
};

export default nextConfig;
