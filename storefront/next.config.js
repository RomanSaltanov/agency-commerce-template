const checkEnvVariables = require("./check-env-variables")
const createNextIntlPlugin = require("next-intl/plugin")

checkEnvVariables()

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const R2_HOSTNAME = process.env.CLOUDFLARE_R2_PUBLIC_HOSTNAME

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(R2_HOSTNAME
        ? [
            {
              protocol: "https",
              hostname: R2_HOSTNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = withNextIntl(nextConfig)
