import { useAccount, useMultisigStore } from "@galacticcouncil/web3-connect"
import { AccountId } from "@polkadot-api/substrate-bindings"
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

      // other_signatories must be sorted by raw public-key bytes (not SS58 string).
      // SS58 encoding changes sort order relative to the underlying bytes, so
      // a plain .sort() on address strings produces SignatoriesOutOfOrder errors.
      const otherSignatories = config.signers
        .filter((s: string) => {
          try {
            const signerBytes = AccountId().enc(signerAddress)
            const sBytes = AccountId().enc(s)
            return !signerBytes.every((b, i) => b === sBytes[i])
          } catch {
            return s !== signerAddress
          }
        })
        .sort((a: string, b: string) => {
          try {
            const rawA = AccountId().enc(a)
            const rawB = AccountId().enc(b)
            for (let i = 0; i < rawA.length; i++) {
              if (rawA[i] < rawB[i]) return -1
              if (rawA[i] > rawB[i]) return 1
            }
            return 0
          } catch {
            return a < b ? -1 : a > b ? 1 : 0
          }
        })

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
