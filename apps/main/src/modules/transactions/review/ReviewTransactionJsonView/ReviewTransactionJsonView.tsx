import { JsonView } from "@galacticcouncil/ui/components"
import { t } from "i18next"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import { CallHashText } from "@/modules/transactions/review/ReviewTransactionJsonView/components/CallHashText"
import { CopyMenu } from "@/modules/transactions/review/ReviewTransactionJsonView/components/CopyMenu"
import { ExpandableSection } from "@/modules/transactions/review/ReviewTransactionJsonView/components/ExpandableSection"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

import { JsonViewContainer } from "./ReviewTransactionJsonView.styled"
import { decodeTx, getTxCallHash } from "./ReviewTransactionJsonView.utils"

export const ReviewTransactionJsonView = () => {
  const { papiCompatibilityToken } = useRpcProvider()
  const { tx } = useTransaction()

  const txJson = decodeTx(tx)
  const txCallHash = getTxCallHash(tx, papiCompatibilityToken)
  const txUrl = usePolkadotJSExtrinsicUrl(tx)

  return (
    <JsonViewContainer>
      <CopyMenu txUrl={txUrl} txCallHash={txCallHash} txJson={txJson} />
      <ExpandableSection title={t("transaction.jsonview.decoded")}>
        <JsonView fs={13} src={txJson} />
      </ExpandableSection>
      <ExpandableSection
        title={t("transaction.jsonview.calldata")}
        maxContentHeight="100%"
      >
        <CallHashText hash={txCallHash} />
      </ExpandableSection>
    </JsonViewContainer>
  )
}
