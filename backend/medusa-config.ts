import { loadEnv, defineConfig } from "@medusajs/framework/utils"

const TRANSLATION_ENABLED = process.env.MEDUSA_FF_TRANSLATION === "true"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const authProviders: any[] = [
  {
    resolve: "@medusajs/auth-emailpass",
    id: "emailpass",
  },
]

if (process.env.GOOGLE_CLIENT_ID) {
  authProviders.push({
    resolve: "@medusajs/auth-google",
    id: "google",
    options: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
  })
}

const modules: any[] = [
  {
    resolve: "@medusajs/medusa/auth",
    options: { providers: authProviders },
  },
]

if (TRANSLATION_ENABLED) {
  modules.push({
    resolve: "@medusajs/translation",
  })
}

if (process.env.CLOUDFLARE_R2_BUCKET) {
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "s3",
          options: {
            file_url: process.env.CLOUDFLARE_R2_PUBLIC_URL,
            access_key_id: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
            secret_access_key: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            region: "auto",
            bucket: process.env.CLOUDFLARE_R2_BUCKET,
            endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
          },
        },
      ],
    },
  })
}

if (process.env.STRIPE_SECRET_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/payment-stripe",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          },
        },
      ],
    },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
    databaseDriverOptions: {
      pool: { min: 1, max: 5 },
    },
  },
  featureFlags: {
    translation: TRANSLATION_ENABLED,
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules,
})
