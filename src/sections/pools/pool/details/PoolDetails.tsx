import { Box } from "components/Box/Box"
import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { formatNum } from "utils/formatting"
import { FC } from "react"
import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"

type Props = {
  assetAName: string
  assetBName: string
  totalValue: BN
  tradingFee: BN
}

export const PoolDetails: FC<Props> = ({
  assetAName,
  assetBName,
  totalValue,
  tradingFee,
}) => {
  const { t } = useTranslation()

  return (
    <Box flex column width={380}>
      <Box flex spread mb={40} ml={4}>
        <Box>
          <Text fs={14} lh={26} color="neutralGray400">
            {t("pools.pool.title")}
          </Text>
          <Box flex acenter>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(assetAName) }}
              secondIcon={{ icon: getAssetLogo(assetBName) }}
            />
            <Box flex column gap={1}>
              <Text fw={700} color="white">
                {assetAName}/{assetBName}
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                Token/Token {/*TODO*/}
              </Text>
            </Box>
          </Box>
        </Box>
        <Box flex column width={120} align="start">
          <Text fs={14} color="neutralGray400" lh={26}>
            {t("pools.pool.poolDetails.fee")}
          </Text>
          <Text lh={22} color="white">
            {tradingFee.times(100).toFixed()}%
          </Text>
        </Box>
      </Box>
      <Separator mb={34} />
      <Box flex spread ml={4} mb={36}>
        <Box>
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("pools.pool.poolDetails.valueLocked")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {t("value.usd", { amount: totalValue })}
          </Text>
        </Box>
        <Box flex column width={120} align="start">
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("pools.pool.poolDetails.24hours")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            - {/*TODO*/}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
