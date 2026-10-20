import { ZecChain } from "@galacticcouncil/xc-core"
import {
  ZEC_LOGICAL_ACTIONS,
  ZEC_MARGINAL_FEE,
  ZecCall,
  ZecSigner as XcZecSigner,
  ZecWallet,
} from "@galacticcouncil/xc-sdk"
import type { ZcashAPI } from "@noir-wallet/sdk"

import { prepareNoirPayment, reportZecSend, ZecTxCallbacks } from "@/utils/zec"

export type { ZecTxStatus } from "@/utils/zec"

// The sdk's fee estimate for one payment, which the transfer was validated with
const ZEC_PAYMENT_FEE = ZEC_LOGICAL_ACTIONS * ZEC_MARGINAL_FEE

/** Signs in Noir, which builds and broadcasts the payment itself. */
export class ZecSigner {
  wallet: ZcashAPI

  constructor(wallet: ZcashAPI) {
    this.wallet = wallet
  }

  async signAndSend(call: ZecCall, chain: ZecChain, options: ZecTxCallbacks) {
    return reportZecSend(async (observer) => {
      let wallet: ZecWallet
      try {
        wallet = await prepareNoirPayment(this.wallet, call, ZEC_PAYMENT_FEE)
      } catch (error) {
        // Refused before Noir opens: reported the way a wallet rejection is
        return observer.onError(error)
      }
      return new XcZecSigner(chain, wallet).signAndSend(call, observer)
    }, options)
  }
}
