import { WalletAssetsTableSkeleton } from "./table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsHydraPositionsSkeleton } from "./hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton"
import { WalletFarmingPositionsSkeleton } from "./farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { Skeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"
import { useAssetsTableData } from "./table/data/WalletAssetsTableData.utils"
import { useState } from "react"
import { useBondsTableData } from "sections/trade/sections/bonds/BondsTable.utils"
import { WalletAssetsTable } from "./table/WalletAssetsTable"
import { BondsTable } from "sections/trade/sections/bonds/table/BondsTable"
import {
  useOmnipoolPositionsData,
  useXykPositionsData,
} from "./hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositions } from "./hydraPositions/WalletAssetsHydraPositions"
import { useFarmingPositionsData } from "./farmingPositions/WalletFarmingPositions.utils"
import { WalletFarmingPositions } from "./farmingPositions/WalletFarmingPositions"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"

export const AllAssets = () => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  const { search } = useWalletAssetsFilters()
  const assetsTable = useAssetsTableData({ isAllAssets: showAll, search })

  const {
    data: bonds,
    isLoading: isLoadingBonds,
    isAllAssets,
    setAllAssets,
  } = useBondsTableData({
    search,
  })

  const positionsTable = useOmnipoolPositionsData({ search })
  const xykPositions = useXykPositionsData({ search })

  const allPositions = [...positionsTable.data, ...xykPositions.data].sort(
    (a, b) => b.valueDisplay.minus(a.valueDisplay).toNumber(),
  )

  const { data: dataFarms, isLoading: isLoadingFarms } =
    useFarmingPositionsData({ search })

  const isLoading =
    assetsTable.isLoading ||
    isLoadingBonds ||
    positionsTable.isInitialLoading ||
    xykPositions.isLoading ||
    isLoadingFarms

  const isAssets = !!assetsTable.data.length
  const isBonds = !!bonds.length
  const isLiqPositions = !!allPositions.length
  const isFarmingPositions = !!dataFarms.length

  if (
    search.length &&
    !isLoading &&
    !isAssets &&
    !isBonds &&
    !isLiqPositions &&
    !isFarmingPositions
  )
    return <EmptySearchState />

  return (
    <div sx={{ flex: "column", gap: [16, 30] }}>
      {assetsTable.isLoading ? (
        <WalletAssetsTableSkeleton />
      ) : (
        <WalletAssetsTable
          data={assetsTable.data}
          showAll={showAll}
          setShowAll={setShowAll}
        />
      )}
      {isLoadingBonds ? (
        <Skeleton title={t("bonds.table.title")} />
      ) : isBonds ? (
        <BondsTable
          title={t("bonds.table.title")}
          data={bonds}
          allAssets={isAllAssets}
          setAllAssets={setAllAssets}
        />
      ) : null}
      {positionsTable.isInitialLoading || xykPositions.isLoading ? (
        <WalletAssetsHydraPositionsSkeleton />
      ) : isLiqPositions ? (
        <WalletAssetsHydraPositions data={allPositions} />
      ) : null}

      {isLoadingFarms ? (
        <WalletFarmingPositionsSkeleton />
      ) : isFarmingPositions ? (
        <WalletFarmingPositions data={dataFarms} />
      ) : null}
    </div>
  )
}

export const Assets = () => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  const { search } = useWalletAssetsFilters()
  const assetsTable = useAssetsTableData({ isAllAssets: showAll, search })

  const {
    data: bonds,
    isLoading: isLoadingBonds,
    isAllAssets,
    setAllAssets,
  } = useBondsTableData({
    search,
  })

  const isLoading = assetsTable.isLoading || isLoadingBonds
  const isAssets = !!assetsTable.data.length
  const isBonds = !!bonds.length

  if (!isLoading && search.length && !isAssets && !isBonds)
    return <EmptySearchState />

  return (
    <div sx={{ flex: "column", gap: [16, 30] }}>
      {assetsTable.isLoading ? (
        <WalletAssetsTableSkeleton />
      ) : (
        <WalletAssetsTable
          data={assetsTable.data}
          showAll={showAll}
          setShowAll={setShowAll}
        />
      )}
      {isLoading ? (
        <Skeleton title={t("bonds.table.title")} />
      ) : isBonds ? (
        <BondsTable
          title={t("bonds.table.title")}
          data={bonds}
          allAssets={isAllAssets}
          setAllAssets={setAllAssets}
        />
      ) : null}
    </div>
  )
}
