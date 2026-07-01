import {
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"
import {
  useAccount,
  useAccountMultisigs,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { isBigInt } from "remeda"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { evmAccountBindingQuery } from "@/api/evm"
import { buildAsMulti } from "@/api/multisig"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import {
  containsEvmCall,
  prependEvmBindingTx,
  transformAnyToPapiTx,
  transformEvmCallToPapiTx,
} from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

const useWrapEvmTransaction = (
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

    if (isEvmAccountBound !== false) return transaction

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
  const { data: multisigs } = useAccountMultisigs()

  const wrapInMultisig = useCallback(
    (
      transaction: SingleTransaction,
      multisigSignerAddress: string,
    ): SingleTransaction => {
      const multisigAccount =
        config &&
        multisigs?.accounts.find(({ pubKey }) =>
          stringEquals(pubKey, safeConvertSS58toPublicKey(config.address)),
        )

      if (!multisigAccount) {
        return transaction
      }

      const tx = transformAnyToPapiTx(papi, transaction.tx)

      if (!tx) {
        return transaction
      }

      return {
        ...transaction,
        tx: buildAsMulti(
          papi,
          multisigSignerAddress,
          multisigAccount,
          tx.decodedCall,
        ),
      }
    },
    [config, multisigs?.accounts, papi],
  )

  return { wrapInMultisig }
}

export const useWrapTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const { account } = useAccount()
  const { wrapInMultisig } = useWrapMultisigTransaction()

  const tx = useWrapEvmTransaction(transaction)

  const multisigSigner = account?.isMultisig
    ? account.multisigSignerAddress
    : undefined

  const isMultisigType =
    isPapiTransaction(tx.tx) && tx.tx.decodedCall?.type === "Multisig"

  return multisigSigner && !isMultisigType
    ? wrapInMultisig(tx, multisigSigner)
    : tx
}
