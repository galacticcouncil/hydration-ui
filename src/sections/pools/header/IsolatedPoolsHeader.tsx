import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { useXykTvlTotal, useXykVolumeTotal } from "state/store"
import { BN_NAN } from "utils/constants"
import { HeaderValues } from "./PoolsHeader"
import { HeaderTotalData } from "./PoolsHeaderTotal"

export const IsolatedPoolsHeader = () => {
  const { t } = useTranslation()

  const tvl = useXykTvlTotal((state) => state.tvl)
  const volume = useXykVolumeTotal((state) => state.volume)

  return (
    <HeaderValues
      fontSizeLabel={14}
      skeletonHeight={[19, 24]}
      values={[
        {
          label: t("liquidity.header.isolated"),
          content: (
            <HeaderTotalData
              isLoading={!tvl}
              value={tvl ? BN(tvl) : BN_NAN}
              fontSize={[19, 24]}
            />
          ),
        },
        {
          withoutSeparator: true,
          label: t("liquidity.header.24hours"),
          content: (
            <HeaderTotalData
              isLoading={!volume}
              value={volume ? BN(volume) : BN_NAN}
              fontSize={[19, 24]}
            />
          ),
        },
      ]}
    />
  )
}
