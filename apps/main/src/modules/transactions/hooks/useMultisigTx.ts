/* import {
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import { AccountId } from "@polkadot-api/substrate-bindings"
import { useCallback } from "react"

import { AnyPapiTx } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMultisigTx = () => {
  const { papi } = useRpcProvider()
  const { account } = useAccount()
  const activeMultisigConfig = useActiveMultisigConfig()

  const isMultisigActive =
    !!account?.isMultisig && !!account.multisigSignerAddress

  const wrapInMultisig = useCallback(
    async (tx: AnyPapiTx): Promise<AnyPapiTx> => {
      const config = activeMultisigConfig
      if (!config || !account || !account?.multisigSignerAddress) return tx

      const signerAddress = account.multisigSignerAddress

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
              const byteA = rawA[i] ?? 0
              const byteB = rawB[i] ?? 0
              if (byteA < byteB) return -1
              if (byteA > byteB) return 1
            }
            return 0
          } catch {
            return a < b ? -1 : a > b ? 1 : 0
          }
        })

      const info = await tx.getPaymentInfo(signerAddress, {
        at: "best",
      })

      return papi.tx.Multisig.as_multi({
        threshold: config.threshold,
        other_signatories: otherSignatories,
        maybe_timepoint: undefined,
        call: tx.decodedCall,
        max_weight: info.weight,
      })
    },
    [account, activeMultisigConfig, papi],
  )

  return { isMultisigActive, wrapInMultisig }
}
 */
