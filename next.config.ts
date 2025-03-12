import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
      API_URL: 'https://x02ge7ylrf.execute-api.ap-southeast-2.amazonaws.com/dev/car',
    }
};

export default nextConfig;
