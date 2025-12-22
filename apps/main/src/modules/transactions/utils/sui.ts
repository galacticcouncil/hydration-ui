import { SuiSigner } from "@galacticcouncil/web3-connect/src/signers/SuiSigner"
import { SuiCall } from "@galacticcouncil/xc-sdk"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"

export const signAndSubmitSuiTx: TxSignAndSubmitFn<SuiCall, SuiSigner> = async (
  tx,
  signer,
  { onError, onSubmitted, onSuccess, onFinalized },
) => {
  return signer.signAndSend(tx.data, {
    onError,
    onSubmitted,
    onSuccess,
    onFinalized,
  })
}
