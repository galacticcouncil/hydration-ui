import {
  ModalContentDivider,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import {
  safeConvertAddressSS58,
  safeConvertPublicKeyToSS58,
  safeConvertSS58toPublicKey,
  stringEquals,
} from "@galacticcouncil/utils"
import { MultisigAccount, useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"

import { MultisigIdentity } from "./MultisigIdentity"
import { MultisigStatus } from "./MultisigStatus"

type MultisigSummaryProps = {
  multisig: MultisigAccount
  normalizedApprovals: string[]
  account: ReturnType<typeof useAccount>["account"]
}

export const MultisigSummary: FC<MultisigSummaryProps> = ({
  multisig,
  normalizedApprovals,
  account,
}) => {
  return (
    <Summary separator={<ModalContentDivider />}>
      {multisig.signatories.map((entry) => {
        const sigAddress = safeConvertPublicKeyToSS58(entry.signatory.pubKey)
        const sigApproved = normalizedApprovals.includes(
          safeConvertAddressSS58(sigAddress),
        )

        const isConnectedAsMultisig =
          !!account?.isMultisig &&
          stringEquals(
            safeConvertSS58toPublicKey(account?.multisigSignerAddress ?? ""),
            entry.signatory.pubKey,
          )
        const isConnected =
          !!account && account.publicKey === entry.signatory.pubKey

        return (
          <SummaryRow
            key={entry.id}
            label={
              <MultisigIdentity
                address={sigAddress}
                isYou={isConnected || isConnectedAsMultisig}
              />
            }
            content={<MultisigStatus approved={sigApproved} />}
          />
        )
      })}
    </Summary>
  )
}
