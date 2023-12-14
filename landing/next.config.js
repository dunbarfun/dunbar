/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  async redirects() { return [
  ]},
  images: {
    domains: [
      'i.imgur.com',
      'imagedelivery.net',
      'i.redd.it',
      'static.wikia.nocookie.net',
      'pbs.twimg.com'
    ],
  },
}

module.exports = nextConfig
