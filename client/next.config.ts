import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.dezeen.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stellar.myfilebase.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
