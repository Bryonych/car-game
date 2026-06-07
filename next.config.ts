import type { NextConfig } from "next";

const nextConfig: NextConfig = async () => {
    return {
      output: 'export',
      images: { unoptimized: true },
      trailingSlash: false,
    }
    
};

export default nextConfig;