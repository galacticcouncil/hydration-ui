import {
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  LoadingButton,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  OptionCard,
  Skeleton,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { type FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { TradeFee } from "@/components/TradeFee/TradeFee"
import {
  TradeLimit,
  TradeLimitType,
} from "@/modules/liquidity/components/TradeLimitRow/TradeLimitRow"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import {
  useFormatSurplusHollar,
  usePayoutQuotes,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useClaim } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssetsPrice } from "@/states/displayAsset"

import { ClaimModalPosition } from "./ClaimModalPosition"

type ClaimModalFormProps = {
  row: PropellerWithdrawalRow
  collateral: bigint
  surplusHollar: bigint
  onClose: () => void
}

export const ClaimModalForm: FC<ClaimModalFormProps> = ({
  row,
  collateral,
  surplusHollar,
  onClose,
}) => {
  const { t } = useTranslation(["propeller", "common", "trade"])
  const quotes = usePayoutQuotes(row.vault, collateral)
  const formatSurplus = useFormatSurplusHollar()
  const [payoutAssetId, setPayoutAssetId] = useState(quotes[0]?.asset.id)
  const selected = quotes.find((q) => q.asset.id === payoutAssetId)
  const claim = useClaim({ onSuccess: onClose })

  const [swapAssetId, setSwapAssetId] = useState(payoutAssetId)
  const hasSummary = !!selected?.isSwap || surplusHollar > 0n
  const swapQuote =
    selected?.isSwap || !hasSummary
      ? quotes.find((q) => q.asset.id === swapAssetId && q.isSwap)
      : undefined
  const { getAssetPrice } = useAssetsPrice(quotes.map((q) => q.asset.id))

  return (
    <>
      <ModalBody sx={{ pb: 0 }}>
        <Flex direction="column" gap="l">
          <ClaimModalPosition row={row} />
          <ModalContentDivider />
          <Flex direction="column" gap="s">
            <Text fs="p4" fw={500}>
              {t("withdrawals.claimModal.receiveAs")}
            </Text>
            {quotes.map((q) => (
              <OptionCard
                key={q.asset.id}
                icon={<AssetLogo id={q.asset.id} />}
                label={q.asset.symbol}
                description={q.asset.name}
                value={
                  q.receive === undefined ? (
                    <Skeleton width={80} height="1em" />
                  ) : (
                    t("common:currency", {
                      value: q.receive,
                      symbol: q.asset.symbol,
                    })
                  )
                }
                displayValue={
                  q.receive !== undefined &&
                  getAssetPrice(q.asset.id).isValid &&
                  t("common:currency", {
                    value: Big(q.receive)
                      .times(getAssetPrice(q.asset.id).price)
                      .toString(),
                  })
                }
                isActive={q.asset.id === payoutAssetId}
                onClick={() => {
                  setPayoutAssetId(q.asset.id)
                  if (q.isSwap) setSwapAssetId(q.asset.id)
                }}
              />
            ))}
          </Flex>
          <CollapsibleRoot open={hasSummary}>
            <CollapsibleContent>
              <Summary separator={<ModalContentDivider />} withLeadingSeparator>
                {swapQuote && (
                  <SummaryRow
                    label={t("common:minimumReceived")}
                    content={
                      swapQuote.minimum &&
                      t("common:currency", {
                        value: swapQuote.minimum,
                        symbol: swapQuote.asset.symbol,
                      })
                    }
                    loading={swapQuote.isLoading}
                  />
                )}
                {swapQuote && (
                  <SummaryRow
                    label={t("common:tradeLimit")}
                    content={<TradeLimit type={TradeLimitType.Trade} />}
                  />
                )}
                {swapQuote && (
                  <SummaryRow
                    label={t("trade:market.summary.estTradeFees")}
                    content={
                      <TradeFee
                        swap={swapQuote.swap}
                        receiveAsset={swapQuote.asset}
                        isLoading={swapQuote.isLoading}
                      />
                    }
                  />
                )}
                {surplusHollar > 0n && (
                  <SummaryRow
                    label={t("withdrawals.claimModal.surplus")}
                    content={t("withdrawals.claimModal.surplusAmount", {
                      amount: formatSurplus(surplusHollar),
                    })}
                  />
                )}
              </Summary>
            </CollapsibleContent>
          </CollapsibleRoot>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <LoadingButton
          size="large"
          width="100%"
          isLoading={claim.isPending}
          disabled={!selected || claim.isPending}
          onClick={() =>
            claim.mutate({
              vault: row.vault,
              requestId: row.requestId,
              payoutAssetId,
            })
          }
        >
          {selected &&
            t(
              selected.isSwap
                ? "withdrawals.claimModal.cta.swap"
                : "withdrawals.claimModal.cta.exact",
              { symbol: selected.asset.symbol },
            )}
        </LoadingButton>
      </ModalFooter>
    </>
  )
}
