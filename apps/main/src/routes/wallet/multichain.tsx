import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { WalletMultichainPage } from "@/modules/wallet/multichain/WalletMultichainPage"

export const MULTICHAIN_CHAINS = ["ethereum", "base", "solana", "sui"] as const
export type MultichainChainKey = (typeof MULTICHAIN_CHAINS)[number]

const searchSchema = z.object({
  chain: z.enum(MULTICHAIN_CHAINS).default("ethereum"),
})

export const Route = createFileRoute("/wallet/multichain")({
  component: WalletMultichainPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("wallet", i18n.t),
  }),
})
