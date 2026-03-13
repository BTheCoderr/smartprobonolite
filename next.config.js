/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ensure proper module resolution
    esmExternals: true,
  },
  webpack: (config) => {
    // Ensure proper path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
}

module.exports = nextConfig

