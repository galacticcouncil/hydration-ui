import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EIP1193Provider } from "viem"

import { createHyperliquidWallet, getExchangeClient } from "@/client"
import { tenthsBpsToPercent } from "@/config"
import { hyperliquidQueryKeys } from "@/queries"

type ApproveBuilderFeeConfig = {
  isTestnet: boolean
  builder: string
  /** Approved ceiling in tenths of a basis point, not the fee we charge. */
  maxFeeTenthsBps: number
}

type ApproveBuilderFeeArgs = {
  address: string
  provider: EIP1193Provider
}

/**
 * Approves a builder fee ceiling for our address. Must be signed by the user's
 * main wallet — an agent wallet cannot approve on its behalf.
 */
export const useApproveBuilderFee = ({
  isTestnet,
  builder,
  maxFeeTenthsBps,
}: ApproveBuilderFeeConfig) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ address, provider }: ApproveBuilderFeeArgs) => {
      const wallet = createHyperliquidWallet(address, provider)

      return getExchangeClient(isTestnet, wallet).approveBuilderFee({
        builder: builder as `0x${string}`,
        maxFeeRate: tenthsBpsToPercent(maxFeeTenthsBps),
      })
    },
    onSuccess: (_, { address }) =>
      queryClient.invalidateQueries({
        queryKey: hyperliquidQueryKeys.maxBuilderFee(
          isTestnet,
          address,
          builder,
        ),
      }),
  })
}

type UsdClassTransferArgs = ApproveBuilderFeeArgs & {
  amount: string
  /** `true` moves spot USDC into perp margin, `false` moves it back out. */
  toPerp: boolean
}

/**
 * Moves USDC between the spot and perp balances, which Hyperliquid keeps
 * separate — only the perp balance collateralises positions.
 *
 * Like `approveBuilderFee` this is an EIP-712 user-signed action, so it must be
 * signed by the main wallet. An agent session key cannot sign it.
 */
export const useUsdClassTransfer = ({ isTestnet }: { isTestnet: boolean }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      address,
      provider,
      amount,
      toPerp,
    }: UsdClassTransferArgs) => {
      const wallet = createHyperliquidWallet(address, provider)

      return getExchangeClient(isTestnet, wallet).usdClassTransfer({
        amount,
        toPerp,
      })
    },
    // Both sides of the transfer change, and `all` covers the spot and perp
    // clearinghouse queries alike.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: hyperliquidQueryKeys.all }),
  })
}
