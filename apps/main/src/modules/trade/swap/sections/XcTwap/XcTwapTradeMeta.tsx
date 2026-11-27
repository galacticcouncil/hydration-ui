import {
  Button,
  Flex,
  Modal,
  Stack,
  Summary,
  SummaryRowDisplayValue,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import {
  DEFAULT_FLOOR_BPS,
  DEFAULT_MAX_SLIPPAGE_BPS,
  FILL_TOLERANCE_BPS,
} from "@galacticcouncil/xc-intents"
import Big from "big.js"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { HealthFactorResult } from "@/api/aave"
import { useKrakenSpotPrice } from "@/api/external/kraken"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { HealthFactorChange } from "@/modules/money-market/actions/HealthFactorChange"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { TradeLimitSummaryRow } from "@/modules/trade/swap/sections/XcSwap/components/Summary/TradeLimitSummaryRow"
import {
  formatXcPayoutEvery,
  getYouReceive,
} from "@/modules/trade/swap/sections/XcTwap/utils/payout"
import { XcTwapFormValues } from "@/modules/trade/swap/sections/XcTwap/XcTwap.form"
import { useXcTwap } from "@/modules/trade/swap/sections/XcTwap/XcTwapProvider"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { NATIVE_EVM_ASSET_ID } from "@/utils/consts"
import { toDecimal } from "@/utils/formatting"

type XcTwapTradeMetaProps = {
  readonly priceImpactPct: number | undefined
  readonly healthFactor: HealthFactorResult | undefined
}

// ponytail: hidden until the 20% default floor is settled; flip to show again
const SHOW_MIN_RECEIVED = false

/** What the Intent TWAP receives and costs; sits below the submit. */
export const XcTwapTradeMeta: FC<XcTwapTradeMetaProps> = ({
  priceImpactPct,
  healthFactor,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { watch } = useFormContext<XcTwapFormValues>()
  const { estimate, isEstimateLoading, routeMin, payouts } = useXcTwap()
  const {
    dca: { slippage, payoutEvery },
  } = useTradeSettings(useShallow(pick(["dca"])))
  const { getAsset } = useAssets()
  const weth = getAsset(NATIVE_EVM_ASSET_ID)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [destChain, buyAsset] = watch(["destChain", "buyAsset"])
  const tranches = estimate?.tranches ?? 0

  // Relay: up to (maxRelayFee + orderCost) per order, in WETH
  const relayFee =
    estimate && weth
      ? toDecimal(
          (estimate.fees.maxRelayFee + estimate.fees.orderCost) *
            BigInt(tranches),
          weth.decimals,
        )
      : "0"
  const [relayFeeDisplay, { price: relayFeeUsd, isValid: isRelayPriceValid }] =
    useDisplayAssetPrice(NATIVE_EVM_ASSET_ID, relayFee)

  // Payout: what the destination chain takes per payout, 0 for NEAR
  const payoutFeeTotal = estimate ? BigInt(payouts) * estimate.fees.payout : 0n
  const payoutFee = buyAsset
    ? toDecimal(payoutFeeTotal, buyAsset.decimals)
    : "0"
  // Kraken USD price of the destination coin (BTC, ZEC, NEAR)
  const { data: spotPrice } = useKrakenSpotPrice(destChain?.platform)
  const payoutFeeUsd =
    payoutFeeTotal > 0n
      ? spotPrice
        ? Big(payoutFee).times(spotPrice).toString()
        : null
      : "0"

  if (!destChain || !buyAsset) return null
  // An estimate with errors has no real amounts or fees (amountOut is 0)
  if (!isEstimateLoading && (!estimate || estimate.errors.length)) return null

  const isLoading = !estimate || isEstimateLoading

  const youReceive = estimate
    ? toDecimal(
        getYouReceive(estimate.amountOut, payouts, estimate.fees.payout),
        buyAsset.decimals,
      )
    : "0"
  // The SDK's hard floor, net of the same payout fees as youReceive
  const minReceive = estimate
    ? toDecimal(
        getYouReceive(estimate.minAmountOut, payouts, estimate.fees.payout),
        buyAsset.decimals,
      )
    : "0"

  // ponytail: the estimate doesn't pass maxSlippageBps/floorBps, so the SDK
  // defaults apply; read them from the params here if they're ever set.
  // amountOut is already cut by maxSlippage; this is what that cut costs.
  const slippageAllowance = estimate
    ? toDecimal(
        (estimate.amountOut * BigInt(DEFAULT_MAX_SLIPPAGE_BPS)) /
          BigInt(10_000 - DEFAULT_MAX_SLIPPAGE_BPS),
        buyAsset.decimals,
      )
    : "0"
  // The floor under the live rate plus the router's fill tolerance
  const floorPct =
    100 -
    (100 - DEFAULT_FLOOR_BPS / 100) * (1 - Number(FILL_TOLERANCE_BPS) / 10_000)

  // Destination amount, with its Kraken USD value styled as in the Market summary
  const renderReceive = (amount: string) => (
    <Flex gap="s" align="center" justify="flex-end">
      <SummaryRowValue>
        {t("currency", { value: amount, symbol: buyAsset.symbol })}
      </SummaryRowValue>
      {spotPrice && (
        <SummaryRowDisplayValue>
          {t("parenthesized", {
            value: t("currency", {
              value: Big(amount).times(spotPrice).toString(),
            }),
          })}
        </SummaryRowDisplayValue>
      )}
    </Flex>
  )

  const totalFee =
    isRelayPriceValid && payoutFeeUsd !== null
      ? t("currency", { value: Big(relayFeeUsd).plus(payoutFeeUsd).toString() })
      : "-"

  return (
    <>
      <Summary
        sx={{ width: "100%" }}
        separator={<SwapSectionSeparator />}
        withTrailingSeparator
      >
        {healthFactor?.isSignificantChange && (
          <SwapSummaryRow
            label={t("healthFactor")}
            content={
              <HealthFactorChange
                current={healthFactor.current}
                projected={healthFactor.future}
              />
            }
          />
        )}
        <TradeLimitSummaryRow
          tradeLimit={slippage}
          priceImpact={priceImpactPct ?? 0}
          settingsSection="split"
        />
        {routeMin > 0n && (
          <SwapSummaryRow
            label={t("trade:xc.twap.payout.label")}
            tooltip={
              <Stack gap="xs">
                <Text fs="p5">
                  {t("trade:xc.twap.payout.helper", {
                    symbol: buyAsset.symbol,
                    chain: destChain.name,
                  })}
                </Text>
                {payouts > 0 && (
                  <Text fs="p5">
                    {t("trade:xc.twap.payout.hint", {
                      count: payouts,
                      fee:
                        payoutFeeUsd !== null
                          ? t("currency", { value: payoutFeeUsd })
                          : t("currency", {
                              value: payoutFee,
                              symbol: buyAsset.symbol,
                            }),
                      chain: destChain.name,
                    })}
                  </Text>
                )}
              </Stack>
            }
            content={
              <SummaryRowValue>
                <Flex gap="s" align="center">
                  {formatXcPayoutEvery(payoutEvery)}
                  <Button
                    size="micro"
                    uppercase
                    outline
                    variant="accent"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    {t("edit")}
                  </Button>
                </Flex>
              </SummaryRowValue>
            }
          />
        )}
        <SwapSummaryRow
          label={t("trade:xc.twap.summary.youReceive")}
          tooltip={t("trade:xc.twap.summary.youReceive.tooltip", {
            symbol: buyAsset.symbol,
            maxSlippage: DEFAULT_MAX_SLIPPAGE_BPS / 100,
            value: spotPrice
              ? t("currency", {
                  value: Big(slippageAllowance).times(spotPrice).toString(),
                })
              : t("currency", {
                  value: slippageAllowance,
                  symbol: buyAsset.symbol,
                }),
          })}
          loading={isLoading}
          content={renderReceive(youReceive)}
        />
        {SHOW_MIN_RECEIVED && (
          <SwapSummaryRow
            label={t("minimumReceived")}
            tooltip={t("trade:xc.twap.summary.minReceived.tooltip", {
              slippage,
              symbol: buyAsset.symbol,
              floor: floorPct,
            })}
            loading={isLoading}
            content={renderReceive(minReceive)}
          />
        )}
        <SwapSummaryRow
          label={t("trade:dca.summary.priceImpact")}
          loading={priceImpactPct === undefined}
          content={t("percent", { value: priceImpactPct })}
        />
        <SwapSummaryRow
          label={t("trade:xc.twap.summary.fees")}
          loading={isLoading}
          tooltip={
            !isLoading && (
              <Stack gap="xs">
                <Text fs="p5">
                  {t("trade:xc.twap.summary.feesTooltip.relay", {
                    amount: t("currency", { value: relayFee, symbol: "ETH" }),
                    value: relayFeeDisplay,
                  })}
                </Text>
                <Text fs="p5">
                  {t("trade:xc.twap.summary.feesTooltip.payout", {
                    chain: destChain.name,
                    amount: t("currency", {
                      value: payoutFee,
                      symbol: buyAsset.symbol,
                    }),
                    value:
                      payoutFeeUsd !== null
                        ? t("currency", { value: payoutFeeUsd })
                        : "-",
                  })}
                </Text>
              </Stack>
            )
          }
          content={<SummaryRowValue>{totalFee}</SummaryRowValue>}
        />
      </Summary>
      <Modal
        variant="popup"
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
        <SettingsModal />
      </Modal>
    </>
  )
}
