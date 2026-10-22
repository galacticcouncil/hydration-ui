import { getNeckworkClient } from "@galacticcouncil/indexer/neckwork"

import { ENV } from "@/config/env"

export const PROXY_URL = `${new URL(ENV.VITE_NECKWORK_URL).origin}/proxy`

export const neckworkClient = getNeckworkClient(ENV.VITE_NECKWORK_URL)
