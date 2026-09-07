/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cafeemil.dk",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Ensure trailingSlash can match or redirect cleanly without losing authority
  trailingSlash: false,
};

module.exports = nextConfig;
