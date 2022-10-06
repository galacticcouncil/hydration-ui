import { Box } from "components/Box/Box"
import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FC } from "react"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { getTradeFee, useTotalInPool } from "sections/pools/pool/Pool.utils"

type Props = { pool: PoolBase }

export const PoolDetails: FC<Props> = ({ pool }) => {
  const { t } = useTranslation()
  const { data } = useTotalInPool({ pool })

  return (
    <Box flex column width={380}>
      <Box flex spread mb={32}>
        <Box>
          <Text fs={14} lh={26} color="neutralGray400">
            {t("pools.pool.title", { type: pool.type })}
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
            {t("value.percentage", { value: getTradeFee(pool.tradeFee) })}
          </Text>
        </Box>
      </Box>
      <Separator mb={32} />
      <Box flex spread>
        <Box>
          <Text fs={14} color="neutralGray400" lh={26}>
            {t("pools.pool.poolDetails.total")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {t("value.usd", { amount: data })}
          </Text>
        </Box>
        <Box flex column width={120} align="start">
          <Text fs={14} color="neutralGray400" lh={26}>
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
