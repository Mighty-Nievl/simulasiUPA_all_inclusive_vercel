/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/opengraph-image.png',
        destination: '/opengraph-image',
      },
    ]
  },
}

export default nextConfig
