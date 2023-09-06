import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { MouseEventHandler, ReactNode, useMemo } from "react"
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

export type BondView = "card" | "list"

type Props = {
  view?: BondView
  icon: ReactNode
  name: string
  ticker: string
  maturity: string
  end: string
  start: string
  state: "active" | "upcoming"
  assetId: string
  bondId: string
  onDetailClick: MouseEventHandler<HTMLButtonElement>
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
  icon,
  name,
  maturity,
  end,
  start,
  state,
  onDetailClick,
  assetId,
  bondId,
  ticker,
}: Props) => {
  const { t } = useTranslation()
  const bestNumber = useBestNumber()

  const isActive = state === "active"

  const timestamp = useMemo(() => {
    if (!end || !start || !bestNumber.data) return undefined

    const currentBLockNumber =
      bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0

    const diff = BLOCK_TIME.multipliedBy(
      Number(isActive ? end : start) - currentBLockNumber,
    ).toNumber()

    const date = addSeconds(new Date(), diff)

    const distance = customFormatDuration({
      end: diff * 1000,
      isShort: true,
    })

    return { distance, date }
  }, [end, start, bestNumber.data, isActive])

  const headingFs = view === "card" ? ([19, 26] as const) : ([19, 21] as const)

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
        <Icon icon={icon} size={32} />
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
              {t(`bond.${isActive ? "endingIn" : "startingIn"}`)}
            </Text>
            {timestamp?.date && (
              <InfoTooltip
                text={formatDate(timestamp.date, "dd.MM.yyyy HH:mm")}
              >
                <SInfoIcon />
              </InfoTooltip>
            )}
          </div>
          <Text color="white">{timestamp?.distance.duration}</Text>
        </SItem>
        <SSeparator
          orientation="vertical"
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
              orientation="vertical"
              css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
            />
            <Discount assetId={assetId} bondId={bondId} view={view} />
          </>
        )}
      </div>

      {isActive && (
        <Button
          fullWidth
          onClick={onDetailClick}
          sx={{ mt: view === "card" ? 12 : [12, 0], maxWidth: ["none", 150] }}
        >
          {t("bond.btn")}
        </Button>
      )}
    </SBond>
  )
}
