import { JsonView, ScrollArea, Separator } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
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
  const { tx, meta } = useTransaction()

  const txJson = decodeTx(tx)
  const txCallHash = getTxCallHash(tx, papiCompatibilityToken)
  const txUrl = usePolkadotJSExtrinsicUrl(tx, meta.srcChainKey)

  const isValidTxCallHash = !!txCallHash

  return (
    <JsonViewContainer>
      <ScrollArea>
        <CopyMenu txUrl={txUrl} txCallHash={txCallHash} txJson={txJson} />
        <ExpandableSection
          title={t("transaction.jsonview.decoded")}
          maxContentHeight={isValidTxCallHash ? 120 : 200}
        >
          <JsonView fs={13} src={txJson} />
        </ExpandableSection>
        {isValidTxCallHash && (
          <>
            <Separator
              my={getTokenPx("scales.paddings.base")}
              sx={{ background: getToken("details.borders") }}
            />
            <ExpandableSection
              title={t("transaction.jsonview.calldata")}
              maxContentHeight="100%"
            >
              <CallHashText hash={txCallHash} />
            </ExpandableSection>
          </>
        )}
      </ScrollArea>
    </JsonViewContainer>
  )
}
