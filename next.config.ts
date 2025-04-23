import type { NextConfig } from "next";
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'


const getApiUrl = async () => {
  const client = new SSMClient({region: 'ap-southeast-2'});
  const command = new GetParameterCommand({
    Name: "/car-game/api-url",
    WithDecryption: true,
  });
  try {
    const response = await client.send(command);
    return response.Parameter?.Value ?? '';
  } catch (err) {
    console.log("Error getting parameter", err);
    return '';
  }
};

const nextConfig: NextConfig = async () => {
    const apiUrl = await getApiUrl();
    return {
      output: 'export',
      images: { unoptimized: true },
      trailingSlash: true,
      env: {
        API_URL: apiUrl,
      },
    }
    
};

export default nextConfig;