import z from "zod"

const schema = z.object({
  VITE_PROVIDER_URL: z.url(),
  VITE_INDEXER_URL: z.url(),
  VITE_SQUID_URL: z.url(),
  VITE_SNOWBRIDGE_URL: z.url(),
  VITE_GRAFANA_URL: z.url(),
  VITE_GRAFANA_DSN: z.coerce.number().positive(),
  VITE_ENV: z.enum(["development", "production"]),
  VITE_TRSRY_ADDR: z.string(),
  VITE_EVM_CHAIN_ID: z.coerce.number().positive(),
  VITE_DISPLAY_ASSET_ID: z.string().regex(/^\d+$/),
  VITE_HSM_ENABLED: z.coerce.boolean(),
})

export const ENV = schema.parse(import.meta.env)
