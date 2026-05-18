import { safeConvertSS58toH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { type Abi, encodeFunctionData, type Hex, parseUnits } from "viem"

import {
  ERC20_ABI,
  EVM_CALL_GAS,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
  vaultEvmClient,
} from "@/modules/hdcl-vault/constants"
import { formatNumber } from "@/modules/hdcl-vault/utils/format"
import { useTransactionsStore } from "@/states/transactions"

function useVaultEvmCall() {
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()

  const address = account?.address ?? ""
  const evmAddress = safeConvertSS58toH160(address) as Hex

  const submitTx = useCallback(
    async (
      to: Hex,
      data: Hex,
      abi: Abi,
      toasts: { submitted: string; success: string },
    ) => {
      // Fetch current gas price and add 1% buffer (matches borrow module pattern)
      const gasPrice = await vaultEvmClient.getGasPrice()
      const gasPricePlus = gasPrice + gasPrice / 100n

      const evmCall = {
        from: evmAddress,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: gasPricePlus,
        maxPriorityFeePerGas: gasPricePlus,
        abi: safeStringify(abi),
      }

      return createTransaction(
        { tx: evmCall, toasts },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hdcl-vault"] })
          },
        },
      )
    },
    [evmAddress, createTransaction, queryClient],
  )

  return { evmAddress, submitTx }
}

export function useApproveHollar() {
  const { submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (amount: number) => {
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [VAULT_ADDRESS, parseUnits(amount.toString(), 18)],
      })

      const fmt = formatNumber(amount, 2)
      return submitTx(HOLLAR_ADDRESS, data, [...ERC20_ABI], {
        submitted: `Approving ${fmt} HOLLAR...`,
        success: `${fmt} HOLLAR approved`,
      })
    },
  })
}

export function useDeposit() {
  const { submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (hollarAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [parseUnits(hollarAmount.toString(), 18)],
      })

      const fmt = formatNumber(hollarAmount, 2)
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: `Depositing ${fmt} HOLLAR...`,
        success: `${fmt} HOLLAR deposited`,
      })
    },
  })
}

export function useRequestRedeem() {
  const { submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (hdclAmount: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "requestRedeem",
        args: [parseUnits(hdclAmount.toString(), 18)],
      })

      const fmt = formatNumber(hdclAmount, 2)
      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: `Requesting ${fmt} HDCL withdrawal...`,
        success: `${fmt} HDCL withdrawal requested`,
      })
    },
  })
}

export function useCancelRedeem() {
  const { submitTx } = useVaultEvmCall()

  return useMutation({
    mutationFn: (requestId: number) => {
      const data = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: "cancelRedeem",
        args: [BigInt(requestId)],
      })

      return submitTx(VAULT_ADDRESS, data, [...VAULT_ABI], {
        submitted: "Cancelling withdrawal...",
        success: "Withdrawal cancelled",
      })
    },
  })
}
