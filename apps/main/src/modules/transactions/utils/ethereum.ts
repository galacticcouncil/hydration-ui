import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { EthereumSigner } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"

import { AnyPapiTx, TxSignAndSubmitFn } from "@/modules/transactions/types"

export const signAndSubmitEvmDispatchTx: TxSignAndSubmitFn<
  AnyPapiTx,
  EthereumSigner
> = async (
  tx,
  signer,
  { onError, onSubmitted, onSuccess, onFinalized, weight },
) => {
  const data = (await tx.getEncodedData()).asHex()
  return signer.signAndSubmitDispatch(
    {
      data,
    },
    {
      chainKey: HYDRATION_CHAIN_KEY,
      weight,
      onError,
      onSuccess,
      onSubmitted,
      onFinalized,
    },
  )
}

export const signAndSubmitEvmTx: TxSignAndSubmitFn<
  ExtendedEvmCall,
  EthereumSigner
> = async (
  tx,
  signer,
  { onError, onSubmitted, onSuccess, onFinalized, chainKey },
) => {
  return signer.signAndSubmit(tx, {
    chainKey,
    onError,
    onSuccess,
    onSubmitted,
    onFinalized,
  })
}
