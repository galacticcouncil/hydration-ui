import { MakeGenerics, useSearch } from "@tanstack/react-location"
import { useAssetMeta } from "api/assetMeta"
import { useBonds, useLbpPool } from "api/bonds"
import { Text } from "components/Typography/Text/Text"
import { customFormatDuration, formatDate } from "utils/formatting"
import { ReactComponent as ClockIcon } from "assets/icons/ClockIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Trans, useTranslation } from "react-i18next"
import { BondProgreesBar } from "./components/BondProgressBar/BondProgressBar"
import { useEffect, useMemo } from "react"
import { BLOCK_TIME } from "utils/constants"
import { useBestNumber } from "api/chain"
import Skeleton from "react-loading-skeleton"
import { BondInfoCards } from "./components/BondInfoCards/BondInfoCards"
import { MyActiveBonds } from "sections/trade/sections/bonds/MyActiveBonds"
import { BondDetailsSkeleton } from "./BondDetailsSkeleton"
import { getBondName } from "sections/trade/sections/bonds/Bonds.utils"
import { BondsTrade } from "./components/BondTrade/BondsTradeApp"

export const useQueryParamChange = () => {
  const printOut = () => null

  useEffect(() => {
    window.addEventListener("pushstate", printOut)
    return () => {
      window.removeEventListener("pushstate", printOut)
    }
  }, [])

  return new URLSearchParams(window.location.search)
}

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
  bondId,
  title,
  loading,
}: {
  bondId: string
  title: string
  loading?: boolean
}) => {
  const { t } = useTranslation()
  const lbpPool = useLbpPool(bondId)
  const bestNumber = useBestNumber()

  const isLoading = lbpPool.isLoading || bestNumber.isLoading || loading

  if (isLoading) return <BondsDetailsHeaderSkeleton />

  let endingDuration

  if (bestNumber.data && lbpPool.data?.length && !isLoading) {
    const remainingSeconds = BLOCK_TIME.multipliedBy(
      Number(lbpPool.data[0].end ?? 0) -
        bestNumber.data?.relaychainBlockNumber.toNumber() ?? 0,
    ).toNumber()

    endingDuration = customFormatDuration({ end: remainingSeconds * 1000 })
  }

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
              i18nKey="bonds.details.header.end"
              tOptions={{
                date: endingDuration.duration,
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
  const id = search.assetOut?.toString()

  const bonds = useBonds(id)
  const bond = bonds?.data?.[0]
  const meta = useAssetMeta(bond?.assetId)

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
        bondId={bond.id}
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
