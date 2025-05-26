import {
  isEthereumSigner,
  isPolkadotSigner,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { EVM_PROVIDERS } from "@galacticcouncil/web3-connect/src/config/providers"
import { MutationOptions, useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"

import { TxOptions } from "@/modules/transactions/types"
import {
  signAndSubmitEvmDispatchTx,
  signAndSubmitEvmTx,
} from "@/modules/transactions/utils/ethereum"
import {
  isPapiTransaction,
  signAndSubmitPolkadotTx,
  submitUnsignedPolkadotTx,
} from "@/modules/transactions/utils/polkadot"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { Transaction } from "@/states/transactions"
import { HYDRATION_CHAIN_KEY, NATIVE_EVM_ASSET_ID } from "@/utils/consts"

const USE_LEGACY_PERMIT = false

export const useSignAndSubmit = (
  transaction: Transaction,
  options: MutationOptions<void, Error, TxOptions>,
) => {
  const { legacy_api, papi, papiClient } = useRpcProvider()
  const wallet = useWallet()

  const { tx } = transaction

  const isEvmWallet = wallet ? EVM_PROVIDERS.includes(wallet.provider) : false

  return useMutation({
    ...options,
    mutationFn: async (txOptions: TxOptions) => {
      const shouldUsePermit =
        isEvmWallet &&
        txOptions.chainKey === HYDRATION_CHAIN_KEY &&
        txOptions.feeAssetId !== NATIVE_EVM_ASSET_ID

      console.log({
        shouldUsePermit,
        tx,
        isEvmCall: isEvmCall(tx),
        isEthSigner: isEthereumSigner(wallet?.signer),
      })

      if (isPapiTransaction(tx) && isPolkadotSigner(wallet?.signer)) {
        return signAndSubmitPolkadotTx(tx, wallet.signer, txOptions)
      }

      if (isPapiTransaction(tx) && isEthereumSigner(wallet?.signer)) {
        if (shouldUsePermit) {
          const data = (await tx.getEncodedData()).asHex()
          const permit = await wallet.signer.getPermit(data)

          // Papi dispatch permit is failing, use legacy api for now
          if (USE_LEGACY_PERMIT) {
            const legacyPermitTx =
              legacy_api.tx.multiTransactionPayment.dispatchPermit(
                permit.message.from,
                permit.message.to,
                permit.message.value,
                permit.message.data,
                permit.message.gaslimit,
                permit.message.deadline,
                Number(permit.signature.v),
                permit.signature.r,
                permit.signature.s,
              )

            const unsubscribe = await legacyPermitTx.send((result) => {
              switch (result.status.type) {
                case "Broadcast":
                  return txOptions.onSubmitted(result.txHash.toHex())
                case "InBlock":
                  return txOptions.onSuccess()
                case "Finalized":
                  unsubscribe()
                  return txOptions.onFinalized()
              }
            })

            return
          }

          const permitTx = papi.tx.MultiTransactionPayment.dispatch_permit({
            data: Binary.fromHex(permit.message.data),
            from: Binary.fromHex(permit.message.from),
            to: Binary.fromHex(permit.message.to),
            value: [0n, 0n, 0n, 0n],
            gas_limit: BigInt(permit.message.gaslimit),
            deadline: [BigInt(permit.message.deadline), 0n, 0n, 0n],
            v: Number(permit.signature.v),
            r: Binary.fromHex(permit.signature.r),
            s: Binary.fromHex(permit.signature.s),
          })

          return submitUnsignedPolkadotTx(permitTx, papiClient, txOptions)
        }
        return signAndSubmitEvmDispatchTx(tx, wallet.signer, txOptions)
      }

      if (isEvmCall(tx) && isEthereumSigner(wallet?.signer)) {
        return signAndSubmitEvmTx(tx, wallet.signer, txOptions)
      }

      if (isEvmCall(tx) && isPolkadotSigner(wallet?.signer)) {
        return signAndSubmitPolkadotTx(
          transformEvmCallToPapiTx(papi, tx),
          wallet.signer,
          txOptions,
        )
      }

      throw new Error("Unsupported transaction or signer type")
    },
  })
}
