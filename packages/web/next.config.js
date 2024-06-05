/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // TODO: #6 See! We needed CDN_DOMAIN here so that NextJS
    // will serve optimized images from our Router/Distribution.
    remotePatterns: [{ hostname: process.env.CDN_DOMAIN }],
  },
};

module.exports = nextConfig;
