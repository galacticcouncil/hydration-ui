import { createHbrFixtureService } from "@/modules/onramp/bank/utils/hbrFixtureService"
import {
  createHbrHttpService,
  HbrService,
  HbrSessionAccess,
} from "@/modules/onramp/bank/utils/hbrService"

/**
 * The HTTP client when an API base is configured, else the fixture service.
 * The testnet app leaves `VITE_HBR_API_URL` unset, so its bank screens never
 * call an HBR server (API doc rule 18).
 */
export const createHbrService = (args: {
  baseUrl: string | undefined
  session: HbrSessionAccess
  fetchFn?: typeof fetch
}): HbrService =>
  args.baseUrl
    ? createHbrHttpService({
        baseUrl: args.baseUrl,
        session: args.session,
        fetchFn: args.fetchFn,
      })
    : createHbrFixtureService({ session: args.session })
