import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { AccountId } from "polkadot-api"
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

export const useMultisigTx = () => {
  const { papi } = useRpcProvider()
  const { account } = useAccount()
  const activeMultisigConfig = useActiveMultisigConfig()

  const isMultisigActive =
    !!account?.isMultisig && !!account.multisigSignerAddress

  const wrapInMultisig = useCallback(
    (transaction: SingleTransaction): SingleTransaction => {
      const config = activeMultisigConfig
      if (!config || !account || !account?.multisigSignerAddress) {
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

      const signerAddress = account.multisigSignerAddress

      // other_signatories must be sorted by raw public-key bytes (not SS58 string).
      // SS58 encoding changes sort order relative to the underlying bytes, so
      // a plain .sort() on address strings produces SignatoriesOutOfOrder errors.
      const otherSignatories = config.signers
        .filter((s: string) => {
          try {
            const signerBytes = AccountId().enc(signerAddress)
            const sBytes = AccountId().enc(s)
            return !signerBytes.every((b, i) => b === sBytes[i])
          } catch {
            return s !== signerAddress
          }
        })
        .sort((a: string, b: string) => {
          try {
            const rawA = AccountId().enc(a)
            const rawB = AccountId().enc(b)
            for (let i = 0; i < rawA.length; i++) {
              const byteA = rawA[i] ?? 0
              const byteB = rawB[i] ?? 0
              if (byteA < byteB) return -1
              if (byteA > byteB) return 1
            }
            return 0
          } catch {
            return a < b ? -1 : a > b ? 1 : 0
          }
        })

      return {
        ...transaction,
        tx: papi.tx.Multisig.as_multi({
          threshold: config.threshold,
          other_signatories: otherSignatories,
          maybe_timepoint: undefined,
          call: tx.decodedCall,
          max_weight: {
            ref_time: 0n,
            proof_size: 0n,
          },
        }),
      }
    },
    [account, activeMultisigConfig, papi],
  )

  return { isMultisigActive, wrapInMultisig }
}

export const useWrapTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const tx = useWrapEvmTransaction(transaction)
  const { wrapInMultisig } = useMultisigTx()
  return wrapInMultisig(tx)
}
