import {
  DEFAULT_MARKET_SLIPPAGE_PCT,
  MIN_ORDER_NOTIONAL_USD,
  tenthsBpsToPercent,
} from "@galacticcouncil/hyperliquid/config"
import {
  Button,
  Flex,
  Input,
  Slider,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { HYPERLIQUID } from "@/config/hyperliquid"
import { PerpsPanel, PerpsStatRow } from "@/modules/perps/components/PerpsPanel"
import {
  useActiveAssetData,
  useBuilderApproval,
  usePerpsAccount,
  useSpotBalances,
} from "@/modules/perps/PerpsPage.data"
import { usePlaceOrder, useSetLeverage } from "@/modules/perps/PerpsPage.orders"

type Props = {
  symbol: string
  markPx: string
  maxLeverage: number
  isSpot: boolean
  /** Price clicked in the order book, if any. */
  presetPrice: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const PerpsOrderTicket: FC<Props> = ({
  symbol,
  markPx,
  maxLeverage,
  isSpot,
  presetPrice,
}) => {
  const { t } = useTranslation("trade")
  const [isBuy, setIsBuy] = useState(true)
  const [size, setSize] = useState("")
  const [price, setPrice] = useState("")
  const [leverage, setLeverage] = useState(1)
  /** Kept separate from `size` so typing a size doesn't fight the slider. */
  const [sizePercent, setSizePercent] = useState(0)

  useEffect(() => {
    if (presetPrice) setPrice(presetPrice)
  }, [presetPrice])

  const { isApproved } = useBuilderApproval()
  const { data: account } = usePerpsAccount()
  const { data: active } = useActiveAssetData(symbol, !isSpot)
  const placeOrder = usePlaceOrder()
  const setLeverageMutation = useSetLeverage()

  // Leverage is an account setting per market, so the slider starts from what
  // is already set and is clamped to what the market allows. Both change with
  // the symbol; the account value only moves when an update is applied.
  const accountLeverage = active?.leverage.value

  useEffect(() => {
    setLeverage(clamp(accountLeverage ?? 1, 1, maxLeverage))
  }, [symbol, maxLeverage, accountLeverage])

  const { balances } = useSpotBalances()
  const mark = Number(markPx) || 0
  const isMarket = price === ""

  // Size is always denominated in the base asset — KNTQ for KNTQ/USDC.
  const [baseCoin = symbol, quoteCoin = "USDC"] = symbol.split("/")
  const balanceOf = (coin: string) =>
    Number(balances.find((b) => b.coin === coin)?.total ?? 0)

  /**
   * Rounding up a 100% sell puts the order above the balance and Hyperliquid
   * rejects it outright, so sizes are always floored.
   */
  const toSize = (value: number) =>
    value > 0 ? String(Math.floor(value * 1e6) / 1e6) : ""

  const onSizePercent = (percent: number) => {
    const fraction = percent / 100

    if (isSpot) {
      // A sell spends the base asset; a buy spends the quote asset.
      if (!isBuy) return setSize(toSize(balanceOf(baseCoin) * fraction))
      if (!mark) return

      return setSize(toSize((balanceOf(quoteCoin) * fraction) / mark))
    }

    // Perp margin backs both sides, so leverage scales buying power either way.
    const collateral = Number(account?.withdrawable ?? 0)

    if (!mark || !collateral) return

    setSize(toSize((collateral * leverage * fraction) / mark))
  }

  /** Notional the order would put on, priced at the limit or the mark. */
  const orderValue = Number(size) * (Number(price) || mark)
  const isBelowMinimum = orderValue > 0 && orderValue < MIN_ORDER_NOTIONAL_USD

  const canSubmit =
    !!size && isApproved && !isBelowMinimum && !placeOrder.isPending

  return (
    <PerpsPanel
      title={t(isSpot ? "perps.ticket.title.spot" : "perps.ticket.title", {
        symbol,
      })}
    >
      <Stack gap="m">
        <Flex gap="s">
          <Button
            size="small"
            variant={isBuy ? "success" : "muted"}
            onClick={() => setIsBuy(true)}
            sx={{ flex: 1 }}
          >
            {t(isSpot ? "perps.ticket.buy" : "perps.ticket.long")}
          </Button>
          <Button
            size="small"
            variant={isBuy ? "muted" : "danger"}
            onClick={() => setIsBuy(false)}
            sx={{ flex: 1 }}
          >
            {t(isSpot ? "perps.ticket.sell" : "perps.ticket.short")}
          </Button>
        </Flex>

        {!isSpot && (
          <Stack gap="xs">
            <Flex justify="space-between">
              <Text fs="p6">{t("perps.ticket.leverage")}</Text>
              <Text fs="p6" fw={600}>{`${leverage}x`}</Text>
            </Flex>
            <Slider
              value={leverage}
              min={1}
              max={maxLeverage}
              step={1}
              onChange={setLeverage}
            />
            <Button
              size="small"
              variant="muted"
              disabled={
                setLeverageMutation.isPending || leverage === accountLeverage
              }
              onClick={() => setLeverageMutation.mutate({ symbol, leverage })}
            >
              {setLeverageMutation.isPending
                ? t("perps.ticket.leverage.pending")
                : t("perps.ticket.leverage.apply")}
            </Button>
            {setLeverageMutation.isError && (
              <Text fs="p6" color="red500">
                {setLeverageMutation.error.message}
              </Text>
            )}
          </Stack>
        )}

        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fs="p6">{t("perps.ticket.size", { symbol: baseCoin })}</Text>
            <Text fs="p6" font="mono" sx={{ opacity: 0.7 }}>
              {`${sizePercent}%`}
            </Text>
          </Flex>
          <Input
            value={size}
            placeholder="0.0"
            onChange={(e) => {
              setSize(e.target.value)
              setSizePercent(0)
            }}
          />
          <Slider
            value={sizePercent}
            min={0}
            max={100}
            step={1}
            dashCount={4}
            disabled={!mark}
            onChange={(percent) => {
              setSizePercent(percent)
              onSizePercent(percent)
            }}
          />
        </Stack>

        <Stack gap="xs">
          <Text fs="p6">{t("perps.ticket.price")}</Text>
          <Input
            value={price}
            placeholder={t("perps.ticket.price.market", { markPx })}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Stack>

        <Stack gap="xs">
          <PerpsStatRow
            label={t("perps.ticket.orderValue")}
            value={orderValue ? `$${orderValue.toFixed(2)}` : "N/A"}
          />
          {isMarket && (
            <PerpsStatRow
              label={t("perps.ticket.slippage")}
              value={`${DEFAULT_MARKET_SLIPPAGE_PCT}%`}
            />
          )}
          <PerpsStatRow
            label={t(
              isSpot ? "perps.ticket.feeLabel.spot" : "perps.ticket.feeLabel",
            )}
            value={tenthsBpsToPercent(HYPERLIQUID.fee)}
          />
        </Stack>

        {isBelowMinimum && (
          <Text fs="p6" color="red500">
            {t("perps.ticket.minNotional", { min: MIN_ORDER_NOTIONAL_USD })}
          </Text>
        )}

        {!isApproved && (
          <Text fs="p6" sx={{ opacity: 0.7 }}>
            {t("perps.ticket.approveFirst")}
          </Text>
        )}

        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() =>
            placeOrder.mutate({
              symbol,
              isBuy,
              size,
              price: isMarket ? markPx : price,
              tif: isMarket ? "FrontendMarket" : "Gtc",
            })
          }
        >
          {placeOrder.isPending
            ? t("perps.ticket.pending")
            : t("perps.ticket.cta")}
        </Button>

        {placeOrder.isError && (
          <Text fs="p6" color="red500">
            {placeOrder.error.message}
          </Text>
        )}
      </Stack>
    </PerpsPanel>
  )
}
