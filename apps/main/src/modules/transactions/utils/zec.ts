import { isZecChain } from "@galacticcouncil/utils"
import { ZecSigner } from "@galacticcouncil/web3-connect/src/signers/ZecSigner"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ZecCall } from "@galacticcouncil/xc-sdk"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"

export const signAndSubmitZecTx: TxSignAndSubmitFn<ZecCall, ZecSigner> = async (
  tx,
  signer,
  { chainKey, onError, onSubmitted, onSuccess, onFinalized },
) => {
  const chain = chainsMap.get(chainKey)

  if (!chain || !isZecChain(chain)) {
    throw new Error("Unsupported chain")
  }

  return signer.signAndSend(tx, chain, {
    onError,
    onSubmitted,
    onSuccess,
    onFinalized,
  })
}
