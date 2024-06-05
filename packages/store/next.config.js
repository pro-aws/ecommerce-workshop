/** @type {import('next').NextConfig} */
module.exports = {
  typescript: { ignoreBuildErrors: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ hostname: process.env.CDN_DOMAIN }]
  },
  async redirects() {
    return [
      {
        source: '/password',
        destination: '/',
        permanent: true
      }
    ];
  }
};
