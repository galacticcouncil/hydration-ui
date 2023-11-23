import { useMedia } from "react-use"
import { theme } from "theme"
import { ChartsWrapper } from "./components/ChartsWrapper/ChartsWrapper"
// TODO: Not ready. Requested in #861n9ffe4
// import { StatsTiles } from "sections/stats/components/StatsTiles/StatsTiles"
import { PieWrapper } from "./components/PieWrapper/PieWrapper"
import { useOmnipoolAssetDetails } from "sections/stats/StatsPage.utils"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { OmnipoolAssetsTableWrapperData } from "./components/OmnipoolAssetsTableWrapper/OmnipoolAssetsTableWrapper"
import { useMemo } from "react"
import { BN_0, BN_1 } from "utils/constants"

export const StatsPOL = () => {
  const assetDetails = useOmnipoolAssetDetails()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { POLMultiplier, totalVolume, totalPol } = useMemo(() => {
    const { totalTvl, totalPol, totalVolume } = assetDetails.data.reduce(
      (acc, omnipoolAsset) => {
        acc = {
          totalTvl: acc.totalTvl.plus(omnipoolAsset.tvl),
          totalPol: acc.totalPol.plus(omnipoolAsset.pol),
          totalVolume: acc.totalVolume.plus(omnipoolAsset.volume),
        }
        return acc
      },
      { totalTvl: BN_0, totalPol: BN_0, totalVolume: BN_0 },
    )

    const POLMultiplier = BN_1.minus(totalPol.div(totalTvl))

    return {
      POLMultiplier,
      totalVolume,
      totalPol,
    }
  }, [assetDetails.data])

  const polAssetsDetails = useMemo(
    () =>
      POLMultiplier
        ? assetDetails.data.map((asset) => ({
            ...asset,
            volumePol: asset.volume.multipliedBy(POLMultiplier),
          }))
        : assetDetails.data,

    [POLMultiplier, assetDetails.data],
  )

  return (
    <div sx={{ flex: "column", gap: [24, 50] }}>
      <div sx={{ flex: "row", gap: 20 }}>
        <PieWrapper
          data={assetDetails.data}
          isLoading={assetDetails.isLoading}
          POLMultiplier={POLMultiplier}
          totalVolume={totalVolume}
          totalPol={totalPol}
        />
        {isDesktop && (
          <SContainerVertical
            sx={{
              p: 24,
              justify: "space-between",
              flexGrow: 3,
              gap: 20,
            }}
          >
            <ChartsWrapper POLMultiplier={POLMultiplier} />
          </SContainerVertical>
        )}
      </div>
      {/*TODO: Not ready. Requested in #861n9ffe4*/}
      {/*<StatsTiles />*/}
      <OmnipoolAssetsTableWrapperData
        data={polAssetsDetails}
        isLoading={assetDetails.isLoading}
      />
    </div>
  )
}
