import { Box } from "components/Box/Box"
import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FC } from "react"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { usePoolTotalValue } from "sections/pools/pool/Pool.utils"

type Props = { pool: PoolBase }

export const PoolDetails: FC<Props> = ({ pool }) => {
  const { t } = useTranslation()
  const { data } = usePoolTotalValue({ pool })

  return (
    <Box flex column width={380}>
      <Box flex spread mb={40} ml={4}>
        <Box>
          <Text fs={14} lh={26} color="neutralGray400">
            {t("pools.pool.title")}
          </Text>
          <Box flex acenter>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(pool.tokens[0].symbol) }}
              secondIcon={{ icon: getAssetLogo(pool.tokens[1].symbol) }}
            />
            <Box flex column gap={1}>
              <Text fw={700} color="white">
                {pool.tokens[0].symbol}/{pool.tokens[1].symbol}
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
            {t("value.percentage", { percentage: pool.tradeFee })}
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
            {t("value.usd", { amount: data })}
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
