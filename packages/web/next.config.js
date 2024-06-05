/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ hostname: process.env.CDN_DOMAIN }],
  },
};

module.exports = nextConfig;
