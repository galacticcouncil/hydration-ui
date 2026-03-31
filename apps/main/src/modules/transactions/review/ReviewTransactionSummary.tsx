import {
  Separator,
  Skeleton,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount, useMultisigStore } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useMultisigDeposit, useMultisigSignerBalance } from "@/api/multisig"
import { ReviewTransactionFee } from "@/modules/transactions/review/ReviewTransactionFee"
import { ReviewTransactionMortality } from "@/modules/transactions/review/ReviewTransactionMortality"
import { ReviewTransactionTip } from "@/modules/transactions/review/ReviewTransactionTip/ReviewTransactionTip"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { TransactionType } from "@/states/transactions"

const RowSeparator = () => <Separator mx="var(--modal-content-inset)" />

const MultisigDepositRow = () => {
  const { t } = useTranslation(["common"])
  const { account } = useAccount()
  const { getActiveConfig } = useMultisigStore()

  const config = getActiveConfig()
  const numSignatories = config?.signers.length ?? 0

  const { data, isLoading } = useMultisigDeposit(numSignatories)

  if (!account?.isMultisig || !config) return null

  return (
    <SummaryRow
      label={t("transaction.summary.multisigDeposit.label")}
      content={
        isLoading ? (
          <Skeleton width={80} />
        ) : (
          <Text as="span" fs="p5" fw={500} color={getToken("text.high")}>
            {t("currency", {
              value: data?.depositHuman,
              symbol: data?.symbol,
            })}{" "}
            <Text as="span" fs="p5" color={getToken("text.medium")}>
              {t("transaction.summary.multisigDeposit.hint")}
            </Text>
          </Text>
        )
      }
    />
  )
}

const SignerBalanceRow = () => {
  const { t } = useTranslation(["common"])
  const { account } = useAccount()
  const { data, isLoading } = useMultisigSignerBalance()

  if (!account?.isMultisig) return null

  return (
    <SummaryRow
      label={t("transaction.summary.signerBalance.label")}
      content={
        isLoading ? (
          <Skeleton width={80} />
        ) : (
          <Text as="span" fs="p5" fw={500} color={getToken("text.high")}>
            {t("currency", {
              value: data?.transferableHuman,
              symbol: data?.symbol,
            })}
          </Text>
        )
      }
    />
  )
}

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
      <MultisigDepositRow />
      <SignerBalanceRow />
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
