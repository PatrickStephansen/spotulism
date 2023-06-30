/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        // pathname: "platform/profilepic"
      },
      {
        protocol: "https",
        hostname: "i.scdn.co"
      }
    ],
  },
};

module.exports = nextConfig;
