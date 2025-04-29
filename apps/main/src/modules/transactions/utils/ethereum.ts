import { EthereumSigner } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"
import { EvmCall } from "@galacticcouncil/xcm-sdk"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"
import { AnyPapiTx } from "@/states/transactions"

export const signAndSubmitEvmDispatchTx: TxSignAndSubmitFn<
  AnyPapiTx,
  EthereumSigner
> = async (tx, signer, { onError, onSubmitted, onSuccess, onFinalized }) => {
  const data = (await tx.getEncodedData()).asHex()
  return signer.signAndSubmitDispatch(
    {
      data,
    },
    {
      chainKey: "hydration",
      onError,
      onSuccess,
      onSubmitted,
      onFinalized,
    },
  )
}

export const signAndSubmitEvmTx: TxSignAndSubmitFn<
  EvmCall,
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
