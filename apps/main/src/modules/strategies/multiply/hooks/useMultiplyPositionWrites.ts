import { safeConvertH160toSS58 } from "@galacticcouncil/utils"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, type Hex, parseUnits } from "viem"

import { ERC20_ABI } from "@/modules/strategies/bil/config/abi"
import {
  type BatchEvmCall,
  useVaultEvmCall,
} from "@/modules/strategies/bil/hooks/useVaultWrites"
import {
  LOOPER_FACTORY_ABI,
  LOOPER_POSITION_ABI,
} from "@/modules/strategies/multiply/config/abi"
import {
  MULTIPLY_ACTION_GAS,
  MULTIPLY_QUERY_KEY_PREFIX,
} from "@/modules/strategies/multiply/config/constants"
import {
  LOOPER_FACTORY_ADDRESS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
import { type MultiplyPosition } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { isRungExpired } from "@/modules/strategies/multiply/utils/status"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const INVALIDATE = [[MULTIPLY_QUERY_KEY_PREFIX]]

const positionCall = (
  position: Hex,
  functionName: "withdraw" | "close" | "resume",
  args: readonly bigint[] = [],
): BatchEvmCall => ({
  to: position,
  data: encodeFunctionData({
    abi: LOOPER_POSITION_ABI,
    functionName,
    args: args as never,
  }),
  abi: [...LOOPER_POSITION_ABI],
})

export const useMultiplyPositionWrites = (pair: MultiplyPair) => {
  const { t } = useTranslation("strategies")
  const { evm, papi } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { evmAddress, submitBatch } = useVaultEvmCall()

  const collateral = getAssetWithFallback(pair.collateralAssetId)
  const submit = (
    calls: BatchEvmCall[],
    toasts: { submitted: string; success: string },
  ) => submitBatch(calls, toasts, INVALIDATE, MULTIPLY_ACTION_GAS)

  const deposit = useMutation({
    mutationFn: async ({
      position,
      amount,
    }: {
      position: MultiplyPosition
      amount: string
    }) => {
      const factory = LOOPER_FACTORY_ADDRESS!
      const amountBig = parseUnits(amount, collateral.decimals)
      const calls: BatchEvmCall[] = []

      const allowance = await evm.readContract({
        address: pair.collateral,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [evmAddress, factory],
      })
      if (allowance < amountBig) {
        calls.push({
          to: pair.collateral,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [factory, amountBig],
          }),
          abi: [...ERC20_ABI],
        })
      }

      calls.push({
        to: factory,
        data: encodeFunctionData({
          abi: LOOPER_FACTORY_ABI,
          functionName: "deposit",
          args: [position.id, amountBig],
        }),
        abi: [...LOOPER_FACTORY_ABI],
      })

      const values = {
        amount,
        symbol: collateral.symbol,
        id: position.id.toString(),
      }
      return submit(calls, {
        submitted: t("multiply.deposit.toast.submitted", values),
        success: t("multiply.deposit.toast.success", values),
      })
    },
  })

  const withdraw = useMutation({
    mutationFn: ({
      position,
      amount,
    }: {
      position: MultiplyPosition
      amount: string
    }) => {
      const values = {
        amount,
        symbol: collateral.symbol,
        id: position.id.toString(),
      }
      return submit(
        [
          positionCall(position.address, "withdraw", [
            parseUnits(amount, collateral.decimals),
          ]),
        ],
        {
          submitted: t("multiply.withdraw.toast.submitted", values),
          success: t("multiply.withdraw.toast.success", values),
        },
      )
    },
  })

  const close = useMutation({
    mutationFn: (position: MultiplyPosition) => {
      const values = { id: position.id.toString() }
      return submit([positionCall(position.address, "close")], {
        submitted: t("multiply.close.toast.submitted", values),
        success: t("multiply.close.toast.success", values),
      })
    },
  })

  /**
   * A stalled ladder resumes with id 0. A rung past its deadline needs its live
   * intent id, read from the position's own account; when the intent is
   * already cleaned up, the id is rebuilt from its submission second, which
   * still passes the contract's prefix check and falls through to reconcile.
   */
  const resume = useMutation({
    mutationFn: async (position: MultiplyPosition) => {
      let intentId = 0n

      if (isRungExpired(position, Date.now())) {
        const submittedAt = BigInt(position.pendingSubmittedAt)
        const entries = await papi.query.Intent.AccountIntents.getEntries(
          safeConvertH160toSS58(position.address),
        )
        const live = entries
          .map(({ keyArgs }) => keyArgs[1])
          .find((id) => (id >> 64n) / 1000n === submittedAt)

        intentId = live ?? (submittedAt * 1000n) << 64n
      }

      const values = { id: position.id.toString() }
      return submit([positionCall(position.address, "resume", [intentId])], {
        submitted: t("multiply.resume.toast.submitted", values),
        success: t("multiply.resume.toast.success", values),
      })
    },
  })

  return { deposit, withdraw, close, resume }
}
