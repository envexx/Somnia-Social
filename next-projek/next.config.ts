import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'infura-ipfs.io'],
    unoptimized: true
  },
  trailingSlash: false,
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

export default nextConfig;
