/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NETWORK: process.env.NETWORK,
    ESCROW_ADDRESS: process.env.ESCROW_ADDRESS,
  },
}

module.exports = nextConfig
