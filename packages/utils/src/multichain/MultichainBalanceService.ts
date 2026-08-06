import { AnyChain, AssetAmount, ConfigService } from "@galacticcouncil/xc-core"

import { formatSourceChainAddress, isAddressValidOnChain } from "../helpers/xcm"

export type ChainBalances = {
  chainKey: string
  balances: AssetAmount[]
  error?: Error
}

export type MultichainBalanceServiceOptions = {
  configService: ConfigService
  chains: readonly string[]
}

/**
 * Chain-agnostic balance reader. Depends on `@galacticcouncil/xc-core` only, so
 * it can move into the SDK repo as-is — no React, no react-query, no app state,
 * no Hydration-specific branching.
 */
export class MultichainBalanceService {
  private readonly chains: readonly AnyChain[]

  constructor({ configService, chains }: MultichainBalanceServiceOptions) {
    this.chains = chains.flatMap((key) => {
      const chain = configService.chains.get(key)
      if (!chain) {
        // an xc-cfg bump that renames/removes a chain must not crash the app
        console.warn(`[multichain] unknown chain key "${key}", skipping`)
        return []
      }
      return [chain]
    })
  }

  /**
   * Allowlisted chains the address is valid on, in configured order. Strictly
   * validity-based — no key derivation, which would yield addresses an sr25519
   * account provably cannot sign for.
   */
  getEligibleChains(address: string): AnyChain[] {
    return this.chains.filter((chain) => isAddressValidOnChain(address, chain))
  }

  async getChainBalances(
    address: string,
    chain: string | AnyChain,
  ): Promise<AssetAmount[]> {
    const key = typeof chain === "string" ? chain : chain.key
    const target = this.chains.find((c) => c.key === key)

    if (!target) {
      throw new Error(`[multichain] chain "${key}" is not in the allowlist`)
    }

    if (!isAddressValidOnChain(address, target)) {
      throw new Error(`[multichain] address is not valid on chain "${key}"`)
    }

    // still required: an H160 address is valid on Hydration but the storage
    // read needs its derived SS58
    const formatted = formatSourceChainAddress(address, target)
    return target.getBalances(target.getAssets(), formatted)
  }

  async getBalances(address: string): Promise<ChainBalances[]> {
    const chains = this.getEligibleChains(address)
    const results = await Promise.allSettled(
      chains.map((chain) => this.getChainBalances(address, chain)),
    )

    return results.map((result, i) => {
      const chainKey = chains[i].key
      return result.status === "fulfilled"
        ? { chainKey, balances: result.value }
        : {
            chainKey,
            balances: [],
            error:
              result.reason instanceof Error
                ? result.reason
                : new Error(String(result.reason)),
          }
    })
  }
}
