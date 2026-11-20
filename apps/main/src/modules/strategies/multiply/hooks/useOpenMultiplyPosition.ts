import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { ERC20_ABI } from "@/modules/strategies/bil/config/abi"
import {
  type BatchEvmCall,
  useVaultEvmCall,
} from "@/modules/strategies/bil/hooks/useVaultWrites"
import { LOOPER_FACTORY_ABI } from "@/modules/strategies/multiply/config/abi"
import {
  MULTIPLY_APPROVE_GAS,
  MULTIPLY_OPEN_GAS,
  MULTIPLY_QUERY_KEY_PREFIX,
} from "@/modules/strategies/multiply/config/constants"
import {
  LOOPER_FACTORY_ADDRESS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { useLooperRecoveryStore } from "@/modules/strategies/multiply/hooks/useLooperRecoveryStore"
import { getIntentFloors } from "@/modules/strategies/multiply/utils/projection"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useLooperSlippageBps } from "@/states/looperSettings"
import { useTransactionsStore } from "@/states/transactions"

export type OpenMultiplyPositionInput = {
  amount: string
  leverage: number
  collateralPriceInDebt: number
}

/** `factory.open`'s amount, floors and fee budget, in base units */
export type OpenCallArgs = {
  amount: bigint
  leverage: number
  minIntentDebt: bigint
  minIntentAToken: bigint
  feeBudget: bigint
}

/**
 * The open sequence: approves the collateral and the fee budget to the factory
 * when the allowance is short (exact amounts — the ERC20 precompile rejects
 * uint256.max), then `factory.open`.
 */
export const useOpenCalls = (pair: MultiplyPair) => {
  const { evm } = useRpcProvider()
  const { evmAddress } = useVaultEvmCall()
  const slippageBps = useLooperSlippageBps()

  return useCallback(
    async ({
      amount,
      leverage,
      minIntentDebt,
      minIntentAToken,
      feeBudget,
    }: OpenCallArgs) => {
      const factory = LOOPER_FACTORY_ADDRESS
      if (!factory) {
        throw new Error("VITE_LOOPER_FACTORY_ADDRESS is not configured")
      }

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
        slippageBps,
        leverage: parseUnits(leverage.toFixed(2), 18),
        minHf: pair.minHf,
        stepHf: pair.stepHf,
        feeReserve: pair.feeReserve,
        minIntentDebt,
        minIntentAToken,
      }

      const calls: BatchEvmCall[] = []

      const approvals: [Hex, bigint][] = [
        [pair.collateral, amount],
        [pair.feeAsset, feeBudget],
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
            gas: MULTIPLY_APPROVE_GAS,
          })
        }
      }

      calls.push({
        to: factory,
        data: encodeFunctionData({
          abi: LOOPER_FACTORY_ABI,
          functionName: "open",
          args: [params, amount, feeBudget],
        }),
        abi: [...LOOPER_FACTORY_ABI],
      })

      return calls
    },
    [pair, evm, evmAddress, slippageBps],
  )
}

/** Opens a Multiply position with the collateral itself, in one batch. */
export const useOpenMultiplyPosition = (pair: MultiplyPair) => {
  const { t } = useTranslation("strategies")
  const { getAssetWithFallback } = useAssets()
  const display = useResolveAssetDisplay()
  const { buildBatchTx } = useVaultEvmCall()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const buildOpenCalls = useOpenCalls(pair)
  const clearRecovery = useLooperRecoveryStore((s) => s.clear)

  return useMutation({
    mutationFn: async ({
      amount,
      leverage,
      collateralPriceInDebt,
    }: OpenMultiplyPositionInput) => {
      const collateral = display(pair.collateralAssetId)
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

      const calls = await buildOpenCalls({
        amount: amountBig,
        leverage,
        feeBudget: pair.feeBudget,
        ...floors,
      })

      const toastValues = {
        amount,
        symbol: collateral.symbol,
        leverage,
      }

      // ponytail: no pre-sign dry-run yet; a batch can't be eth_call'ed with its
      // approvals, so the AaveRefused-on-OOG check waits for a deployed factory to test against
      return createTransaction(
        {
          tx: await buildBatchTx(calls, MULTIPLY_OPEN_GAS),
          toasts: {
            submitted: t("multiply.open.toast.submitted", toastValues),
            success: t("multiply.open.toast.success", toastValues),
          },
          invalidateQueries: [[MULTIPLY_QUERY_KEY_PREFIX]],
        },
        // opening with the collateral finishes an interrupted two-step entry,
        // but only once it lands
        { onSuccess: () => clearRecovery(pair.slug) },
      )
    },
  })
}
