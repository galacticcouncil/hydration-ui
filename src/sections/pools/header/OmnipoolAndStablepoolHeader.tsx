import BN from "bignumber.js"
import { useOmnipoolTvlTotal, useOmnipoolVolumeTotal } from "state/store"
import { HeaderValues } from "./PoolsHeader"
import { useTranslation } from "react-i18next"
import { HeaderTotalData } from "./PoolsHeaderTotal"
import { BN_NAN } from "utils/constants"
import { StablePoolsTotal } from "./StablePoolsTotal"

export const OmnipoolAndStablepoolHeader = () => {
  const { t } = useTranslation()
  const tvl = useOmnipoolTvlTotal((state) => state.tvl)
  const volume = useOmnipoolVolumeTotal((state) => state.volume)

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
