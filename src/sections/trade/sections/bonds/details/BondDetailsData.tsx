import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { useAssetMeta } from "api/assetMeta"
import {
  isPoolUpdateEvent,
  useBonds,
  useLBPPoolEvents,
  useLbpPool,
} from "api/bonds"
import { Text } from "components/Typography/Text/Text"
import { customFormatDuration, formatDate } from "utils/formatting"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Trans, useTranslation } from "react-i18next"
import { BondProgreesBar } from "./components/BondProgressBar/BondProgressBar"
import { useMemo } from "react"
import { BLOCK_TIME } from "utils/constants"
import { useBestNumber } from "api/chain"
import Skeleton from "react-loading-skeleton"
import { BondInfoCards } from "./components/BondInfoCards/BondInfoCards"
import { MyActiveBonds } from "sections/trade/sections/bonds/MyActiveBonds"
import { BondDetailsSkeleton } from "./BondDetailsSkeleton"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { BondsTrade } from "./components/BondTrade/BondsTradeApp"
import { addSeconds } from "date-fns"
import { theme } from "theme"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

type SearchGenerics = MakeGenerics<{
  Search: { assetOut: number; assetIn: number }
}>

export const BondsDetailsHeaderSkeleton = () => {
  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <Skeleton width={200} height={26} />
      <div sx={{ flex: "row", align: "center", gap: 4 }}>
        <Icon sx={{ color: "brightBlue300" }} icon={<ClockIcon />} />

        <Skeleton width={150} height={22} />
      </div>
    </div>
  )
}

export const BondDetailsHeader = ({
  title,
  end,
  accumulatedAssetId,
}: {
  title: string
  end?: number
  accumulatedAssetId?: number
}) => {
  const { t } = useTranslation()

  const bestNumber = useBestNumber()
  const accumulatedAssetMeta = useAssetMeta(String(accumulatedAssetId))

  const isLoading = bestNumber.isLoading

  if (isLoading || !bestNumber.data || !accumulatedAssetMeta.data)
    return <BondsDetailsHeaderSkeleton />

  let endingDuration
  let date

  if (end && !isLoading) {
    const remainingSeconds = BLOCK_TIME.multipliedBy(
      end - bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0,
    ).toNumber()

    endingDuration = customFormatDuration({ end: remainingSeconds * 1000 })

    date = addSeconds(new Date(), remainingSeconds)
  }

  const isPast = bestNumber.data?.relaychainBlockNumber.toNumber() > (end ?? 0)

  return (
    <div
      sx={{
        flex: ["column", "row"],
        justify: "space-between",
        align: "center",
        gap: [20, 0],
        mt: ["-55px", 0],
      }}
    >
      <div sx={{ flex: "column", align: ["center", "flex-start"] }}>
        <Text fs={[15, 24]} color="white" font="FontOver">
          {title}
        </Text>
        {accumulatedAssetId && accumulatedAssetMeta.data && (
          <div sx={{ flex: "row", gap: 4 }}>
            <Text
              fs={[13, 16]}
              css={{ color: `rgba(${theme.rgbColors.white}, 0.7)` }}
            >
              {t("bonds.details.header.accumulatedAsset")}
            </Text>
            <Icon
              size={16}
              icon={<AssetLogo id={accumulatedAssetMeta.data.id} />}
            />
            <Text
              fs={[13, 16]}
              css={{ color: `rgba(${theme.rgbColors.white}, 0.7)` }}
            >
              {accumulatedAssetMeta.data.symbol}
            </Text>
          </div>
        )}
      </div>

      <div sx={{ flex: "row", align: "center", gap: 4 }}>
        <Icon sx={{ color: "brightBlue300" }} icon={<ClockIcon />} />
        {endingDuration ? (
          <Text fs={20} color="white" font="ChakraPetchSemiBold">
            <Trans
              t={t}
              i18nKey={`bonds.details.header.${isPast ? "endPast" : "end"}`}
              tOptions={{
                date:
                  isPast && date
                    ? formatDate(date, "dd.MM.yyyy HH:mm")
                    : endingDuration.duration,
              }}
            >
              <span sx={{ color: "brightBlue300", fontSize: 20 }} />
            </Trans>
          </Text>
        ) : (
          <Skeleton width={150} height={22} />
        )}
      </div>
    </div>
  )
}

export const BondDetailsData = () => {
  const search = useSearch<SearchGenerics>()
  //TODO: check both assetIn and assetOut
  const id = search.assetOut?.toString()

  const bonds = useBonds({ id })
  const bond = bonds?.data?.[0]
  const meta = useAssetMeta(bond?.assetId)

  const lbpPool = useLbpPool({ id: bond?.id })
  const isPast = !lbpPool.isLoading && !lbpPool.data
  const lbpPoolEvents = useLBPPoolEvents(isPast ? bond?.id : undefined)

  const lbpPoolData = useMemo(() => {
    if (lbpPool.data) return lbpPool.data[0]

    if (lbpPoolEvents.data?.events.length) {
      const lbpPoolData = lbpPoolEvents.data.events
        .filter(isPoolUpdateEvent)
        .reverse()?.[0]

      return lbpPoolData.args.data
    }

    return undefined
  }, [lbpPool.data, lbpPoolEvents.data])

  const data = useMemo(() => {
    if (!bond) return undefined

    const maturityDate = new Date(bond.maturity)
    const maturityValue = formatDate(maturityDate, "dd.MM.yyyy")

    return { maturityDate, maturityValue }
  }, [bond])

  if (!bond || !data || !meta.data) return <BondDetailsSkeleton />

  return (
    <div sx={{ flex: "column", gap: [20, 40] }}>
      <BondDetailsHeader
        title={getBondName(meta.data.symbol, data.maturityDate, true)}
        accumulatedAssetId={lbpPoolData?.assets.find(
          (asset: number) => asset !== Number(bond?.id),
        )}
        end={lbpPoolData?.end}
      />

      <BondsTrade />

      <BondProgreesBar
        bondId={bond?.id}
        decimals={meta.data?.decimals.toNumber()}
      />

      <BondInfoCards
        assetId={bond?.assetId}
        maturity={data?.maturityValue}
        bondId={bond.id}
      />

      <MyActiveBonds assetId={bond.assetId} />
    </div>
  )
}
