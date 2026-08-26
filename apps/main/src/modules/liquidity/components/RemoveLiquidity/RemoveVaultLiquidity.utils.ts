import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { safeConvertAnyToH160, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useCallback } from "react"
import { encodeFunctionData, Hex, parseAbi } from "viem"

import { estimateGasLimit } from "@/api/borrow"
import { VaultState } from "@/api/vaults"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

const EVM_CALL_GAS = 700_000

export const HYPERVISOR_WITHDRAW_ABI = parseAbi([
  "function withdraw(uint256 shares, address to, address from, uint256[4] minAmounts) returns (uint256 amount0, uint256 amount1)",
])

// Unlike depositing, withdraw is a direct Hypervisor call: no whitelist, no
// approval (from must be msg.sender), and no range guard, so it works while the
// vault is out of range. minAmounts guards the two _burnLiquidity calls against
// a keeper rebalance landing between quote and execution.
export const useVaultWithdraw = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const evmAddress = safeConvertAnyToH160(account?.address ?? "") as Hex

  return useCallback(
    async ({
      vault,
      shares,
      minAmounts,
    }: {
      vault: VaultState
      shares: bigint
      minAmounts: [bigint, bigint, bigint, bigint]
    }) => {
      const data = encodeFunctionData({
        abi: HYPERVISOR_WITHDRAW_ABI,
        functionName: "withdraw",
        args: [shares, evmAddress, evmAddress, minAmounts],
      })

      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } =
        await estimateGasLimit({
          evm: rpc.evm,
          gasLimit: EVM_CALL_GAS.toString(),
        })

      const evmCall: ExtendedEvmCall = {
        from: evmAddress,
        to: vault.address,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit,
        maxFeePerGas: maxFeePerGas[0],
        maxPriorityFeePerGas: maxPriorityFeePerGas[0],
        abi: safeStringify([...HYPERVISOR_WITHDRAW_ABI]),
      }

      return createTransaction({
        tx: transformEvmCallToPapiTx(rpc.papi, evmCall),
        toasts: {
          submitted: "Removing liquidity from the vault",
          success: "Removed liquidity from the vault",
        },
        invalidateQueries: [["vault"], ["vaultShares"], ["pools", "v3"]],
      })
    },
    [evmAddress, rpc, createTransaction],
  )
}
