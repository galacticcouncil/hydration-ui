import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import { ERC20_ABI } from "@/modules/strategies/bil/config/abi"
import {
  type BatchEvmCall,
  useVaultEvmCall,
} from "@/modules/strategies/bil/hooks/useVaultWrites"
import { LOOPER_FACTORY_ABI } from "@/modules/strategies/multiply/config/abi"
import {
  MULTIPLY_OPEN_GAS,
  MULTIPLY_QUERY_KEY_PREFIX,
} from "@/modules/strategies/multiply/config/constants"
import {
  LOOPER_FACTORY_ADDRESS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { getIntentFloors } from "@/modules/strategies/multiply/utils/projection"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export type OpenMultiplyPositionInput = {
  amount: string
  leverage: number
  collateralPriceInDebt: number
}

/**
 * Opens a Multiply position: approves the collateral and the fee budget to the
 * factory when the allowance is short (exact amounts — the ERC20 precompile
 * rejects uint256.max), then `factory.open`, in one batch.
 */
export const useOpenMultiplyPosition = (pair: MultiplyPair) => {
  const { t } = useTranslation("strategies")
  const { evm } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitBatch } = useVaultEvmCall()

  return useMutation({
    mutationFn: async ({
      amount,
      leverage,
      collateralPriceInDebt,
    }: OpenMultiplyPositionInput) => {
      const factory = LOOPER_FACTORY_ADDRESS
      if (!factory) {
        throw new Error("VITE_LOOPER_FACTORY_ADDRESS is not configured")
      }

      const collateral = getAssetWithFallback(pair.collateralAssetId)
      const debt = getAssetWithFallback(pair.debtAssetId)
      const aCollateral = getAssetWithFallback(
        pair.aCollateralAssetId.toString(),
      )
      const amountBig = parseUnits(amount, collateral.decimals)

      const floors = getIntentFloors({
        amount: amountBig,
        collateralDecimals: collateral.decimals,
        debtDecimals: debt.decimals,
        collateralPriceInDebt,
        debtEd: BigInt(debt.existentialDeposit),
        aCollateralEd: BigInt(aCollateral.existentialDeposit),
      })

      const params = {
        collateral: pair.collateral,
        aCollateral: pair.aCollateral,
        debt: pair.debt,
        variableDebt: pair.variableDebt,
        feeAsset: pair.feeAsset,
        debtAssetId: Number(pair.debtAssetId),
        aCollateralAssetId: pair.aCollateralAssetId,
        feeAssetId: Number(pair.feeAssetId),
        eMode: pair.eMode,
        slippageBps: pair.slippageBps,
        leverage: parseUnits(leverage.toFixed(2), 18),
        minHf: pair.minHf,
        stepHf: pair.stepHf,
        feeReserve: pair.feeReserve,
        ...floors,
      }

      const calls: BatchEvmCall[] = []

      const approvals: [Hex, bigint][] = [
        [pair.collateral, amountBig],
        [pair.feeAsset, pair.feeBudget],
      ]
      for (const [token, value] of approvals) {
        const allowance = await evm.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [evmAddress, factory],
        })

        if (allowance < value) {
          calls.push({
            to: token,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "approve",
              args: [factory, value],
            }),
            abi: [...ERC20_ABI],
          })
        }
      }

      calls.push({
        to: factory,
        data: encodeFunctionData({
          abi: LOOPER_FACTORY_ABI,
          functionName: "open",
          args: [params, amountBig, pair.feeBudget],
        }),
        abi: [...LOOPER_FACTORY_ABI],
      })

      const toastValues = {
        amount,
        symbol: collateral.symbol,
        leverage: leverage.toFixed(1),
      }

      // ponytail: no pre-sign dry-run yet; a batch can't be eth_call'ed with its
      // approvals, so the AaveRefused-on-OOG check waits for a deployed factory to test against
      return submitBatch(
        calls,
        {
          submitted: t("multiply.open.toast.submitted", toastValues),
          success: t("multiply.open.toast.success", toastValues),
        },
        [[MULTIPLY_QUERY_KEY_PREFIX]],
        MULTIPLY_OPEN_GAS,
      )
    },
  })
}
