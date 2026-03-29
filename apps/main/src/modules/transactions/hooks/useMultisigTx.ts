import { useAccount, useMultisigStore } from "@galacticcouncil/web3-connect"
import { useCallback } from "react"

import { AnyPapiTx } from "@/modules/transactions/types"
import { Papi } from "@/providers/rpcProvider"

/**
 * When an active multisig config is set, this hook provides a function to wrap
 * any Polkadot extrinsic in `Multisig.as_multi` so it is submitted as the first
 * approval from the connected signer.
 */
export const useMultisigTx = () => {
  const { account } = useAccount()
  const { getActiveConfig } = useMultisigStore()

  const isMultisigActive =
    !!account?.isMultisig && !!account.multisigSignerAddress

  const wrapInMultisig = useCallback(
    async (papi: Papi, tx: AnyPapiTx): Promise<AnyPapiTx> => {
      const config = getActiveConfig()
      if (!config || !account?.multisigSignerAddress) return tx

      const signerAddress = account.multisigSignerAddress

      // Get fee estimation to obtain weight for max_weight parameter
      const paymentInfo = await tx.getPaymentInfo(signerAddress)
      const maxWeight = paymentInfo.weight

      // other_signatories must be sorted lexicographically by raw bytes, excluding the signer
      const otherSignatories = config.signers
        .filter((s: string) => s !== signerAddress)
        .sort()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (papi as any).tx.Multisig.as_multi({
        threshold: config.threshold,
        other_signatories: otherSignatories,
        maybe_timepoint: undefined,
        call: tx.decodedCall,
        max_weight: maxWeight,
      }) as AnyPapiTx
    },
    [account, getActiveConfig],
  )

  return { isMultisigActive, wrapInMultisig }
}
