import {
  Separator,
  Skeleton,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { ReviewTransactionFee } from "@/modules/transactions/review/ReviewTransactionFee"
import { ReviewTransactionMortality } from "@/modules/transactions/review/ReviewTransactionMortality"
import { ReviewTransactionTip } from "@/modules/transactions/review/ReviewTransactionTip/ReviewTransactionTip"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { TransactionType } from "@/states/transactions"

const RowSeparator = () => <Separator mx="var(--modal-content-inset)" />

const OnchainSummary = () => {
  const { t } = useTranslation(["common"])
  const { nonce, isLoadingNonce, meta } = useTransaction()

  if (meta.type !== TransactionType.Onchain) return null

  const srcChain = chainsMap.get(meta.srcChainKey)

  const isPolkadotEcosystem = srcChain?.ecosystem === ChainEcosystem.Polkadot
  const isHydration = srcChain?.key === HYDRATION_CHAIN_KEY
  return (
    <Stack
      separated
      separator={<RowSeparator />}
      sx={{ mb: "var(--modal-content-inset)" }}
    >
      <SummaryRow
        label={t("transaction.summary.cost.label")}
        content={<ReviewTransactionFee />}
      />
      {isPolkadotEcosystem && (
        <SummaryRow
          label={t("transaction.summary.mortality.label")}
          content={<ReviewTransactionMortality />}
        />
      )}
      {isHydration && (
        <SummaryRow
          label={t("transaction.summary.nonce.label")}
          content={isLoadingNonce ? <Skeleton width={30} /> : nonce?.toString()}
        />
      )}
      {isHydration && (
        <SummaryRow
          label={t("transaction.summary.tip.label")}
          content={<ReviewTransactionTip />}
        />
      )}
    </Stack>
  )
}

const XcmSummary = () => {
  const { t } = useTranslation(["common"])
  const { meta } = useTransaction()

  if (meta.type !== TransactionType.Xcm) return null

  const srcChain = chainsMap.get(meta.srcChainKey)

  const isPolkadotEcosystem = srcChain?.ecosystem === ChainEcosystem.Polkadot
  return (
    <Stack
      separated
      separator={<RowSeparator />}
      sx={{ mb: "var(--modal-content-inset)" }}
    >
      <SummaryRow
        label={t("transaction.summary.srcFee.label")}
        content={t("currency", {
          value: meta.srcChainFee,
          symbol: meta.srcChainFeeSymbol,
        })}
      />
      {Big(meta.dstChainFee || "0").gt(0) && (
        <SummaryRow
          label={t("transaction.summary.destFee.label")}
          content={t("currency", {
            value: meta.dstChainFee,
            symbol: meta.dstChainFeeSymbol,
          })}
        />
      )}
      {isPolkadotEcosystem && (
        <SummaryRow
          label={t("transaction.summary.mortality.label")}
          content={<ReviewTransactionMortality />}
        />
      )}
    </Stack>
  )
}

export const ReviewTransactionSummary = () => {
  const { meta } = useTransaction()

  if (meta.type === TransactionType.Onchain) return <OnchainSummary />
  if (meta.type === TransactionType.Xcm) return <XcmSummary />
  return null
}
