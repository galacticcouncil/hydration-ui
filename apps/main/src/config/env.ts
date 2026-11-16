import z from "zod"

const coerceToBoolean = z.string().transform((v) => v === "true")

// HBR (bank ramp) API base: an https origin, or a same-origin path such as
// "/hbr" behind a dev proxy. Unset or empty = the bank screens use fixtures.
const hbrApiUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z
    .union([z.url({ protocol: /^https$/ }), z.string().regex(/^\/[a-z0-9-]+$/)])
    .optional(),
)

const schema = z.object({
  VITE_PROVIDER_URL: z.url(),
  VITE_INDEXER_URL: z.url(),
  VITE_NECKWORK_URL: z.url(),
  VITE_TRANSFERS_SCAN_URL: z.url(),
  VITE_GRAFANA_URL: z.url(),
  VITE_GRAFANA_DSN: z.coerce.number().positive(),
  VITE_ENV: z.enum(["development", "production"]),
  VITE_TRSRY_ADDR: z.string(),
  VITE_EVM_CHAIN_ID: z.coerce.number().positive(),
  VITE_DISPLAY_ASSET_ID: z.string().regex(/^\d+$/),
  VITE_HSM_ENABLED: coerceToBoolean,
  VITE_DRY_RUN_ENABLED: coerceToBoolean,
  VITE_WORMHOLE_DISABLED: coerceToBoolean,
  VITE_BASEJUMP_DISABLED: coerceToBoolean,
  VITE_SNOWBRIDGE_DISABLED: coerceToBoolean,
  VITE_SNOWBRIDGE_INBOUND_DISABLED: coerceToBoolean,
  VITE_HBR_API_URL: hbrApiUrl,
})

export const ENV = schema.parse(import.meta.env)
