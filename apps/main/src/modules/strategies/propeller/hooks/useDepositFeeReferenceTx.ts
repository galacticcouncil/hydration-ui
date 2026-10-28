import {
  getAddressFromAssetId,
  safeConvertSS58toH160,
  safeStringify,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { encodeFunctionData, erc20Abi, type Hex } from "viem"

import { evmAccountBindingQuery } from "@/api/evm"
import { bestSellWithTxQuery } from "@/api/trade"
import { EVM_CALL_GAS } from "@/modules/strategies/propeller/constants"
import { composeVaultBatch } from "@/modules/strategies/propeller/utils/batch"
import { encodeDeposit } from "@/modules/strategies/propeller/utils/deposit"
import {
  isSwapDeposit,
  type PropellerDepositOption,
} from "@/modules/strategies/propeller/utils/depositOptions"
import { type AnyPapiTx } from "@/modules/transactions/types"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

// the fee depends on the calls and the route, not on the amount
const REFERENCE_AMOUNT = "1"

/**
 * Every call a deposit pays for (bind, swap, approve, deposit) in one batch, so a
 * MAX can keep their fee back when the asset paid with is also the fee asset.
 */
export const useDepositFeeReferenceTx = (
  deposit: PropellerDepositOption,
): AnyPapiTx | null => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const isSwap = isSwapDeposit(deposit)

  const { data: isBound } = useQuery(evmAccountBindingQuery(rpc, address))
  const { data: gasPrice } = useQuery({
    queryKey: ["propeller", "evmGasPrice"],
    queryFn: () => rpc.evm.getGasPrice(),
    enabled: rpc.isReady,
  })
  const { data: quote } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: deposit.assetId,
      assetOut: deposit.vault.assetId,
      amountIn: isSwap ? REFERENCE_AMOUNT : "",
      slippage,
      address,
    }),
  )
  const swapCall = quote?.tx?.decodedCall

  return useMemo(() => {
    if (!address || isBound === undefined || gasPrice === undefined) return null
    if (isSwap && !swapCall) return null

    const owner = safeConvertSS58toH160(address) as Hex
    const asset = getAddressFromAssetId(deposit.vault.assetId) as Hex
    const { vaultAddress: vault } = deposit.vault
    // the same 5% surplus the deposit itself signs with
    const price = gasPrice + (gasPrice * 5n) / 100n
    const evmCall = (to: Hex, data: Hex) =>
      transformEvmCallToPapiTx(rpc.papi, {
        from: owner,
        to,
        data,
        type: CallType.Evm,
        dryRun: (() => Promise.resolve(undefined)) as () => Promise<undefined>,
        gasLimit: EVM_CALL_GAS,
        maxFeePerGas: price,
        maxPriorityFeePerGas: price,
        abi: safeStringify(erc20Abi),
      }).decodedCall
    const approve = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [vault, 1n],
    })
    const { data: depositData } = encodeDeposit({
      vault,
      asset,
      owner,
      amount: 1n,
    })

    return rpc.papi.tx.Utility.batch_all({
      calls: composeVaultBatch(rpc.papi, {
        bind: isBound === false,
        leading: swapCall ? [swapCall] : [],
        evmCalls: [evmCall(asset, approve), evmCall(vault, depositData)],
      }),
    })
  }, [address, isBound, gasPrice, isSwap, swapCall, deposit.vault, rpc.papi])
}
