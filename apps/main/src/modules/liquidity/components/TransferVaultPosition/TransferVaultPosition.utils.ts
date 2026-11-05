import { safeConvertAnyToH160, safeStringify } from "@galacticcouncil/utils"
import { ExtendedEvmCall } from "@galacticcouncil/web3-connect"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { encodeFunctionData, erc20Abi, Hex } from "viem"

import { estimateGasLimit } from "@/api/evm"
import {
  estimateVaultCallGas,
  VaultState,
  vaultTxInvalidation,
} from "@/api/gamma/vaults"
import { V3PoolBase } from "@/api/pools"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useVaultTransfer = () => {
  const { t } = useTranslation("wallet")
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const evmAddress = safeConvertAnyToH160(account?.address ?? "") as Hex

  return useCallback(
    async ({
      pool,
      vault,
      shares,
      recipient,
      amount,
    }: {
      pool: V3PoolBase
      vault: VaultState
      shares: bigint
      recipient: Hex
      amount: string
    }) => {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, shares],
      })

      const [{ maxFeePerGas, maxPriorityFeePerGas }, gasLimit] =
        await Promise.all([
          estimateGasLimit({ evm: rpc.evm }),
          estimateVaultCallGas(rpc.evm, evmAddress, {
            to: vault.address,
            data,
          }),
        ])

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to: vault.address,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit,
        maxFeePerGas: maxFeePerGas[0],
        maxPriorityFeePerGas: maxPriorityFeePerGas[0],
        abi: safeStringify([...erc20Abi]),
      }

      return createTransaction({
        tx: transformEvmCallToPapiTx(rpc.papi, evmCall),
        toasts: {
          submitted: t("transfer.modal.onLoading", {
            amount,
            symbol: vault.shareSymbol,
            address: recipient,
          }),
          success: t("transfer.modal.onSuccess", {
            amount,
            symbol: vault.shareSymbol,
            address: recipient,
          }),
        },
        invalidateQueries: vaultTxInvalidation(pool),
      })
    },
    [evmAddress, rpc, createTransaction, t],
  )
}
