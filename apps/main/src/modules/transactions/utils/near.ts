import { isNearChain } from "@galacticcouncil/utils"
import { NearSigner } from "@galacticcouncil/web3-connect/src/signers/NearSigner"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { NearCall } from "@galacticcouncil/xc-sdk"

import { TxSignAndSubmitFn } from "@/modules/transactions/types"

export const signAndSubmitNearTx: TxSignAndSubmitFn<
  NearCall,
  NearSigner
> = async (
  tx,
  signer,
  { chainKey, onError, onSubmitted, onSuccess, onFinalized },
) => {
  // The source chain decides the network, mainnet or testnet
  const chain = chainsMap.get(chainKey)

  if (!chain || !isNearChain(chain)) {
    throw new Error("Unsupported chain")
  }

  return signer.signAndSend(tx, chain, {
    onError,
    onSubmitted,
    onSuccess,
    onFinalized,
  })
}
