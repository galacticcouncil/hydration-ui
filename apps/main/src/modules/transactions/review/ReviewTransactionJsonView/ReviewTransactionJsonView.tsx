import {
  JsonView,
  JsonViewSkeleton,
  ScrollArea,
  Separator,
  Skeleton,
  TabsContent,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  HYDRATION_CHAIN_KEY,
  useAfterFirstRender,
} from "@galacticcouncil/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMeasure } from "react-use"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import { useTxCallData } from "@/modules/transactions/hooks/useTxCallData"
import { CallHashText } from "@/modules/transactions/review/ReviewTransactionJsonView/components/CallHashText"
import { CopyMenu } from "@/modules/transactions/review/ReviewTransactionJsonView/components/CopyMenu"
import { ExpandableSection } from "@/modules/transactions/review/ReviewTransactionJsonView/components/ExpandableSection"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { AnyTransaction } from "@/modules/transactions/types"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { transformEvmCallToPapiTx } from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useRpcProvider } from "@/providers/rpcProvider"

import {
  JsonViewContainer,
  JsonViewRoot,
  JsonViewTabsList,
  JsonViewTabsTrigger,
} from "./ReviewTransactionJsonView.styled"
import { decodeTx, hasTxCallData } from "./ReviewTransactionJsonView.utils"

type TransactionMode = "default" | "evm" | "substrate"

type JsonContentProps = {
  mode: TransactionMode
  tx: AnyTransaction
  srcChainKey: string
  jsonPath?: string
}

const JSON_MAX_HEIGHT = 200

export const ReviewTransactionJsonContent: React.FC<
  Omit<JsonContentProps, "mode">
> = ({ tx, srcChainKey, jsonPath }) => {
  const { t } = useTranslation("common")

  const hasRendered = useAfterFirstRender()
  const txJson = hasRendered ? decodeTx(tx, jsonPath) : undefined

  const [isCallDataRequested, setIsCallDataRequested] = useState(false)
  const isCallDataEager = !isPapiTransaction(tx)
  const isCallDataEnabled = isCallDataRequested || isCallDataEager

  const { data: txCallHash = "", isFetching: isCallDataLoading } =
    useTxCallData(tx, isCallDataEnabled)
  const txUrl = usePolkadotJSExtrinsicUrl(tx, srcChainKey, isCallDataEnabled)

  const hasCallData = hasTxCallData(tx)

  const [ref, rect] = useMeasure<HTMLDivElement>()

  const isJsonOverflowing = rect.height > JSON_MAX_HEIGHT

  return (
    <>
      <CopyMenu
        txUrl={txUrl}
        txCallHash={txCallHash}
        txJson={txJson}
        onOpenChange={(open) => open && setIsCallDataRequested(true)}
      />
      <ScrollArea>
        <ExpandableSection
          title={t("transaction.jsonview.decoded")}
          maxContentHeight={
            isJsonOverflowing && hasCallData ? JSON_MAX_HEIGHT : "100%"
          }
        >
          {txJson ? (
            <JsonView ref={ref} fs="p6" src={txJson} />
          ) : (
            <JsonViewSkeleton fs="p6" />
          )}
        </ExpandableSection>
        {hasCallData && (
          <>
            <Separator sx={{ background: getToken("details.borders") }} />
            <ExpandableSection
              title={t("transaction.jsonview.calldata")}
              maxContentHeight="100%"
              defaultExpanded={isCallDataEager}
              onExpandedChange={(expanded) =>
                expanded && setIsCallDataRequested(true)
              }
            >
              {isCallDataLoading ? (
                <Skeleton count={2} sx={{ fontSize: "p6" }} />
              ) : (
                txCallHash && <CallHashText hash={txCallHash} />
              )}
            </ExpandableSection>
          </>
        )}
      </ScrollArea>
    </>
  )
}

export const ReviewTransactionJsonView = () => {
  const { t } = useTranslation("common")
  const { papi } = useRpcProvider()
  const { tx, meta } = useTransaction()

  const isHydrationEvm =
    isEvmCall(tx) && meta.srcChainKey === HYDRATION_CHAIN_KEY

  const tabs: JsonContentProps[] = isHydrationEvm
    ? [
        { mode: "evm", tx, srcChainKey: meta.srcChainKey },
        {
          mode: "substrate",
          tx: transformEvmCallToPapiTx(papi, tx),
          srcChainKey: meta.srcChainKey,
        },
      ]
    : [{ mode: "default", tx, srcChainKey: meta.srcChainKey }]

  const hasMultipleTabs = tabs.length > 1
  const defaultMode = tabs[0]?.mode ?? "default"

  return (
    <JsonViewRoot defaultValue={defaultMode}>
      {hasMultipleTabs && (
        <JsonViewTabsList>
          {tabs.map(({ mode }) => (
            <JsonViewTabsTrigger key={mode} value={mode}>
              {t(mode)}
            </JsonViewTabsTrigger>
          ))}
        </JsonViewTabsList>
      )}
      {tabs.map(({ mode, ...props }) => (
        <TabsContent key={mode} value={mode} asChild>
          <JsonViewContainer>
            <ReviewTransactionJsonContent {...props} />
          </JsonViewContainer>
        </TabsContent>
      ))}
    </JsonViewRoot>
  )
}
