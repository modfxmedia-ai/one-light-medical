import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The legacy site serves every page at a trailing-slash URL and 301s the
  // non-slash form, so this preserves the exact indexed URLs after cutover.
  trailingSlash: true,
};

export default nextConfig;
