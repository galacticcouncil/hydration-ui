import { NearChain, NearTxOutcome } from "@galacticcouncil/xc-core"
import {
  NearCall,
  NearSigner as XcNearSigner,
  NearWallet,
} from "@galacticcouncil/xc-sdk"

import { NearTxCallbacks, reportNearSend } from "@/utils/near"

export type NearTxStatus = NearTxOutcome

/** Signs in the connected NEAR wallet, which submits the transaction itself. */
export class NearSigner {
  wallet: NearWallet

  constructor(wallet: NearWallet) {
    this.wallet = wallet
  }

  async signAndSend(
    call: NearCall,
    chain: NearChain,
    options: NearTxCallbacks,
  ) {
    const signer = new XcNearSigner(chain, this.wallet)
    return reportNearSend(
      (observer) => signer.signAndSend(call, observer),
      options,
    )
  }
}
