import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { SBond, SItem } from "./Bond.styled"
import { Icon } from "components/Icon/Icon"
import { useBestNumber } from "api/chain"
import { BLOCK_TIME, BN_1 } from "utils/constants"
import { addSeconds } from "date-fns"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { customFormatDuration, formatDate } from "utils/formatting"
import { SSeparator } from "components/Separator/Separator.styled"
import { theme } from "theme"
import { useDisplayPrice } from "utils/displayAsset"
import { useMedia } from "react-use"
import Skeleton from "react-loading-skeleton"
import { isPoolUpdateEvent, useLBPPoolEvents } from "api/bonds"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

export type BondView = "card" | "list"

type Props = {
  view?: BondView
  name: string
  ticker: string
  maturity: string
  end?: number
  start?: number
  state: "active" | "upcoming" | "past"
  assetId: string
  bondId: string
  assetIn?: number
}

const Discount = ({
  assetId,
  bondId,
  view,
}: {
  assetId: string
  bondId: string
  view?: BondView
}) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isCard = view === "card"

  const isColumnView = !isDesktop || isCard
  const spotPrice = useDisplayPrice(assetId)
  const spotPriceBond = useDisplayPrice(bondId)

  const isLoading = spotPrice.isLoading || spotPriceBond.isLoading

  const currentSpotPrice = spotPrice.data?.spotPrice ?? BN_1
  const currentBondPrice = spotPriceBond.data?.spotPrice ?? BN_1

  const isDiscount = currentSpotPrice.gt(currentBondPrice)

  const discount = isDiscount
    ? currentSpotPrice
        .minus(currentBondPrice)
        .div(currentSpotPrice)
        .multipliedBy(100)
    : currentBondPrice
        .minus(currentSpotPrice)
        .div(currentBondPrice)
        .multipliedBy(100)

  return (
    <SItem>
      {isLoading ? (
        <>
          <Skeleton width={isColumnView ? 100 : 60} height={13} />
          <Skeleton width={isColumnView ? 100 : 60} height={13} />
        </>
      ) : (
        <>
          <Text color="basic400" fs={14}>
            {isDiscount ? t("bond.discount") : t("bond.premium")}
          </Text>
          <Text color="white">
            {t("value.percentage", { value: discount })}
          </Text>
        </>
      )}
    </SItem>
  )
}

export const Bond = ({
  view,
  name,
  maturity,
  end,
  start,
  state,
  assetId,
  bondId,
  ticker,
  assetIn,
}: Props) => {
  const { t } = useTranslation()
  const bestNumber = useBestNumber()
  const navigate = useNavigate()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const isActive = state === "active"
  const isPast = state === "past"

  const lbpPool = useLBPPoolEvents(isPast ? bondId : undefined)

  const data = useMemo(() => {
    if (!bestNumber.data) return undefined
    const currentBLockNumber =
      bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0

    if (end && start) {
      const diff = BLOCK_TIME.multipliedBy(
        Number(isActive || isPast ? end : start) - currentBLockNumber,
      ).toNumber()

      const date = addSeconds(new Date(), diff)

      const distance = customFormatDuration({
        end: diff * 1000,
        isShort: true,
      })

      return { distance, date }
    } else if (lbpPool.data) {
      const isRemovedLiquidity = lbpPool.data.events.some(
        (event) => event.name === "LBP.LiquidityRemoved",
      )

      if (isRemovedLiquidity) {
        const lbpPoolData = lbpPool.data.events
          .filter(isPoolUpdateEvent)
          .reverse()?.[0]

        if (lbpPoolData) {
          const assetIn = lbpPoolData.args.data.assets.find(
            (asset: number) => asset !== Number(bondId),
          )

          const diff = BLOCK_TIME.multipliedBy(
            Number(lbpPoolData.args.data.end) - currentBLockNumber,
          ).toNumber()

          const date = addSeconds(new Date(), diff)

          const distance = customFormatDuration({
            end: diff * 1000,
            isShort: true,
          })

          return { distance, date, assetIn }
        }
      }

      return undefined
    }

    return undefined
  }, [bestNumber.data, end, start, lbpPool.data, isActive, isPast, bondId])

  const headingFs = view === "card" ? ([19, 26] as const) : ([19, 16] as const)

  if (!data) return null

  return (
    <SBond view={view ?? "list"}>
      <div
        sx={{
          flex: "row",
          align: "center",
          gap: 16,
          mb: view === "card" ? 12 : [12, 0],
        }}
      >
        <Icon icon={<AssetLogo id={assetId} />} size={30} />
        <div sx={{ flex: "column" }}>
          <Text
            fs={headingFs}
            lh={headingFs}
            sx={{ mt: 3 }}
            font="ChakraPetchSemiBold"
          >
            {ticker}
          </Text>
          <Text fs={13} sx={{ mt: 3 }} color={"whiteish500"}>
            {name}
          </Text>
        </div>
      </div>

      <div
        sx={{ flex: ["column", "row"], justify: "space-evenly" }}
        css={{ flex: "1 0 auto" }}
      >
        <SItem>
          <div sx={{ flex: "row", align: "center", gap: 6 }}>
            <Text color="basic400" fs={14}>
              {t(
                `bond.${
                  isActive ? "endingIn" : isPast ? "ended" : "startingIn"
                }`,
              )}
            </Text>
            {!isPast && (
              <InfoTooltip text={formatDate(data.date, "dd.MM.yyyy HH:mm")}>
                <SInfoIcon />
              </InfoTooltip>
            )}
          </div>
          <Text color="white">
            {isPast
              ? formatDate(data.date, "dd.MM.yyyy HH:mm")
              : data.distance.duration}
          </Text>
        </SItem>

        <SSeparator
          orientation={isDesktop ? "vertical" : "horizontal"}
          css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
        />
        <SItem>
          <Text color="basic400" fs={14}>
            {t("bond.maturity")}
          </Text>
          <Text color="white">{maturity}</Text>
        </SItem>
        {isActive && (
          <>
            <SSeparator
              orientation={isDesktop ? "vertical" : "horizontal"}
              css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
            />
            <Discount assetId={assetId} bondId={bondId} view={view} />
          </>
        )}
      </div>

      {(isActive || isPast) && (
        <Button
          fullWidth
          onClick={() =>
            navigate({
              to: LINKS.bond,
              search: { assetIn: assetIn ?? data?.assetIn, assetOut: bondId },
            })
          }
          sx={{ mt: view === "card" ? 12 : [12, 0], maxWidth: ["none", 150] }}
        >
          {t(isActive ? "bond.btn" : "bond.details.btn")}
        </Button>
      )}
    </SBond>
  )
}
