import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
} from "@galacticcouncil/utils"
import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import {
  AccountId,
  sortMultisigSignatories,
} from "@polkadot-api/substrate-bindings"
import { useQuery } from "@tanstack/react-query"
import { toHex } from "polkadot-api/utils"
import { useCallback, useMemo } from "react"
import { isBigInt } from "remeda"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { evmAccountBindingQuery } from "@/api/evm"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import {
  containsEvmCall,
  prependEvmBindingTx,
  transformEvmCallToPapiTx,
} from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useWrapEvmTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const rpc = useRpcProvider()
  const { papi } = rpc
  const { account } = useAccount()

  const { data: isEvmAccountBound } = useQuery(
    evmAccountBindingQuery(rpc, account?.address ?? ""),
  )

  return useMemo(() => {
    // Wrap with dispatch_with_extra_gas when withExtraGas is set
    if (isPapiTransaction(transaction.tx) && transaction.withExtraGas) {
      return {
        ...transaction,
        tx: papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: transaction.tx.decodedCall,
          extra_gas: isBigInt(transaction.withExtraGas)
            ? transaction.withExtraGas
            : AAVE_GAS_LIMIT,
        }),
      }
    }

    // Account is bound - no binding needed
    if (isEvmAccountBound) return transaction

    // Prepend bind_evm_address for native EVM calls when not bound
    if (isEvmCall(transaction.tx)) {
      return {
        ...transaction,
        tx: prependEvmBindingTx(
          papi,
          papi.tx.Dispatcher.dispatch_evm_call({
            call: transformEvmCallToPapiTx(papi, transaction.tx).decodedCall,
          }),
        ),
      }
    }

    // Prepend bind_evm_address for PAPI transactions that contain an EVM.call when not bound
    if (isPapiTransaction(transaction.tx) && containsEvmCall(transaction.tx)) {
      return { ...transaction, tx: prependEvmBindingTx(papi, transaction.tx) }
    }

    return transaction
  }, [transaction, isEvmAccountBound, papi])
}

const useWrapMultisigTransaction = () => {
  const { papi } = useRpcProvider()
  const config = useActiveMultisigConfig()

  const wrapInMultisig = useCallback(
    (
      transaction: SingleTransaction,
      multisigSignerAddress: string,
    ): SingleTransaction => {
      if (!config) {
        return transaction
      }

      const tx = isPapiTransaction(transaction.tx)
        ? transaction.tx
        : isEvmCall(transaction.tx)
          ? transformEvmCallToPapiTx(papi, transaction.tx)
          : null

      if (!tx) {
        return transaction
      }

      const otherSignatories = config.signers.filter(
        (s) =>
          safeConvertAddressSS58(s) !==
          safeConvertAddressSS58(multisigSignerAddress),
      )

      const sortedOtherSignatories = sortMultisigSignatories(
        otherSignatories.map((s) => AccountId().enc(s)),
      )

      return {
        ...transaction,
        tx: papi.tx.Multisig.as_multi({
          threshold: config.threshold,
          other_signatories: sortedOtherSignatories.map((s) =>
            safeConvertPublicKeyToSS58(toHex(s)),
          ),
          maybe_timepoint: undefined,
          call: tx.decodedCall,
          max_weight: {
            ref_time: 0n,
            proof_size: 0n,
          },
        }),
      }
    },
    [config, papi],
  )

  return { wrapInMultisig }
}

export const useWrapTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const { account } = useAccount()
  const { wrapInMultisig } = useWrapMultisigTransaction()

  const tx = useWrapEvmTransaction(transaction)

  return account?.isMultisig && account.multisigSignerAddress
    ? wrapInMultisig(tx, account.multisigSignerAddress)
    : tx
}
