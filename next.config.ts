import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredUrl =
      process.env.BACKEND_URL ||
      (/^https?:\/\//.test(process.env.NEXT_PUBLIC_API_URL ?? '')
        ? process.env.NEXT_PUBLIC_API_URL!
        : 'http://localhost:4010');
    const backendUrl = configuredUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
