/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
    ]}
}

module.exports = nextConfig
