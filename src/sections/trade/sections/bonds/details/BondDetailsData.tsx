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
}: {
  title: string
  end?: number
}) => {
  const { t } = useTranslation()

  const bestNumber = useBestNumber()

  const isLoading = bestNumber.isLoading

  if (isLoading || !bestNumber.data) return <BondsDetailsHeaderSkeleton />

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
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <Text fs={24} color="white" font="FontOver">
        {title}
      </Text>

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

    if (lbpPoolEvents.data) {
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
    <div sx={{ flex: "column", gap: 40 }}>
      <BondDetailsHeader
        title={getBondName(meta.data.symbol, data.maturityDate, true)}
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
