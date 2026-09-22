import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import type { Address } from "viem"

import { walletBalanceProviderAbi } from "@/core/abi"
import { normalize } from "@/core/big"
import { chainRead, decode } from "@/core/chain"
import { walletBalancesSchema } from "@/core/schema"
import type {
  MarketDescriptor,
  MarketWalletBalances,
  Reserve,
  WalletBalance,
} from "@/types"

/**
 * Reads how much of each reserve's underlying asset a user holds in their
 * wallet — what caps a supply.
 *
 * The wallet balance provider answers with addresses and raw amounts and no
 * decimals, so the market's reserves are a parameter: they are what gives an
 * amount a unit. They are passed in rather than read here because the caller
 * already has them, and reading them again would both cost a round trip and
 * risk valuing a balance against a different block's reserve list.
 *
 * Like every other user-scoped read, this one stands alone — a wallet balance
 * failure must not be able to take the reserve list down with it.
 */
export const readWalletBalances = async (
  config: Config,
  market: MarketDescriptor,
  user: Address,
  reserves: Reserve[],
): Promise<MarketWalletBalances> => {
  const { WALLET_BALANCE_PROVIDER, POOL_ADDRESSES_PROVIDER } = market.addresses

  const payload = await chainRead(
    market,
    WALLET_BALANCE_PROVIDER,
    "wallet balances",
    () =>
      readContract(config, {
        address: WALLET_BALANCE_PROVIDER,
        abi: walletBalanceProviderAbi,
        functionName: "getUserWalletBalances",
        args: [POOL_ADDRESSES_PROVIDER, user],
      }),
  )

  const [assets, amounts] = decode(
    walletBalancesSchema,
    payload,
    "wallet balances",
  )

  const decimals = new Map(
    reserves.map((reserve) => [reserve.underlyingAsset, reserve.decimals]),
  )

  const balances = assets.reduce<WalletBalance[]>(
    (accumulated, underlyingAsset, index) => {
      const assetDecimals = decimals.get(underlyingAsset)
      const amount = amounts[index]
      // An address the reserve list does not know carries no unit, so it is
      // dropped rather than reported in the wrong one.
      if (assetDecimals === undefined || amount === undefined) {
        return accumulated
      }
      accumulated.push({
        underlyingAsset,
        amount: normalize(amount, assetDecimals),
      })
      return accumulated
    },
    [],
  )

  return {
    user: user.toLowerCase() as Address,
    balances,
  }
}
