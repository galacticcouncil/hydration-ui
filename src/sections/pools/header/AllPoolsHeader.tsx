import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import {
  useOmnipoolTvlTotal,
  useOmnipoolVolumeTotal,
  useXykTvlTotal,
  useXykVolumeTotal,
} from "state/store"
import { HeaderValues } from "./PoolsHeader"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { StablePoolsTotal } from "./StablePoolsTotal"
import { BN_NAN } from "utils/constants"

export const AllPoolsHeader = () => {
  const { t } = useTranslation()

  const tvl = useOmnipoolTvlTotal((state) => state.tvl)
  const volume = useOmnipoolVolumeTotal((state) => state.volume)
  const xykTvl = useXykTvlTotal((state) => state.tvl)
  const xykVolume = useXykVolumeTotal((state) => state.volume)

  return (
    <HeaderValues
      fontSizeLabel={14}
      skeletonHeight={[19, 24]}
      values={[
        {
          label: t("liquidity.header.omnipool"),
          content: (
            <HeaderTotalData
              isLoading={!tvl}
              value={tvl ? BN(tvl) : BN_NAN}
              fontSize={[19, 24]}
            />
          ),
        },
        {
          label: t("liquidity.header.stablepool"),
          content: <StablePoolsTotal />,
        },

        {
          label: t("liquidity.header.isolated"),
          content: (
            <HeaderTotalData
              isLoading={!xykTvl}
              value={xykTvl ? BN(xykTvl) : BN_NAN}
              fontSize={[19, 24]}
            />
          ),
        },

        {
          withoutSeparator: true,
          label: t("liquidity.header.24hours"),
          content: (
            <HeaderTotalData
              isLoading={!volume && !xykVolume}
              value={volume && xykVolume ? BN(volume).plus(xykVolume) : BN_NAN}
              fontSize={[19, 24]}
            />
          ),
        },
      ]}
    />
  )
}
