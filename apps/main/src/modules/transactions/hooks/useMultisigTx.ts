import { useAccount, useMultisigStore } from "@galacticcouncil/web3-connect"
import { PolkadotClient } from "polkadot-api"
import { useCallback } from "react"

import { AnyPapiTx } from "@/modules/transactions/types"

/**
 * When an active multisig config is set, this hook provides a function to wrap
 * any Polkadot extrinsic in `Multisig.as_multi` so it is submitted as the first
 * approval from the connected signer.
 *
 * Uses getUnsafeApi() because the hydration descriptor does not include the
 * Multisig pallet in its typed tx surface.
 */
export const useMultisigTx = () => {
  const { account } = useAccount()
  const { getActiveConfig } = useMultisigStore()

  const isMultisigActive =
    !!account?.isMultisig && !!account.multisigSignerAddress

  const wrapInMultisig = useCallback(
    async (papiClient: PolkadotClient, tx: AnyPapiTx): Promise<AnyPapiTx> => {
      const config = getActiveConfig()
      if (!config || !account?.multisigSignerAddress) return tx

      const signerAddress = account.multisigSignerAddress

      // Use a generous fixed max_weight instead of fetching via getPaymentInfo.
      // Fetching adds an async RPC round-trip that can push the tx past its era
      // window (Invalid.Stale). The chain only charges actual weight used;
      // max_weight is just an upper-bound safety check.
      const maxWeight = {
        ref_time: 10_000_000_000n,
        proof_size: 1_000_000n,
      }

      // other_signatories must be sorted lexicographically by raw bytes, excluding the signer
      const otherSignatories = config.signers
        .filter((s: string) => s !== signerAddress)
        .sort()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeTx = (papiClient.getUnsafeApi().tx as any).Multisig.as_multi({
        threshold: config.threshold,
        other_signatories: otherSignatories,
        maybe_timepoint: undefined,
        call: tx.decodedCall,
        max_weight: maxWeight,
      })

      return unsafeTx as AnyPapiTx
    },
    [account, getActiveConfig],
  )

  return { isMultisigActive, wrapInMultisig }
}
