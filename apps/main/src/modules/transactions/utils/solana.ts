import { SolanaSigner } from "@galacticcouncil/web3-connect/src/signers/SolanaSigner"
import { SolanaCall } from "@galacticcouncil/xc-sdk"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"

export const signAndSubmitSolanaTx: TxSignAndSubmitFn<
  SolanaCall,
  SolanaSigner
> = async (tx, signer, { onError, onSubmitted, onSuccess, onFinalized }) => {
  return signer.signAndSend(tx.data, tx.signers, {
    onError,
    onSuccess,
    onSubmitted,
    onFinalized,
  })
}
