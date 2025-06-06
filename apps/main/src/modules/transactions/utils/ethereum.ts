import { ExtendedEvmCall } from "@galacticcouncil/money-market/types"
import { EthereumSigner } from "@galacticcouncil/web3-connect/src/signers/EthereumSigner"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"
import { AnyPapiTx } from "@/states/transactions"
import { HYDRATION_CHAIN_KEY } from "@/utils/consts"

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
      chainKey: HYDRATION_CHAIN_KEY,
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
