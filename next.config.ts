// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["tsx", "ts"],  // Ensure it recognizes TypeScript pages
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prpropertystore.com",
      },
    ],
  },
};

export default nextConfig;


