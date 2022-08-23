import { Box } from "components/Box/Box"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PoolSharesPositions } from "sections/pools/pool/shares/positions/PoolSharesPositions"

export const PoolShares = () => {
  const { t } = useTranslation()

  return (
    <Box bg={"black"}>
      <Box p="22px 60px 34px 25px">
        <GradientText text={t("pools.pool.liquidity.title")} mb={11} />
        <Box flex spread>
          <Box width={220}>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("pools.pool.liquidity.unstakedShares")}
            </Text>
            <Text fs={14} lh={18} color="white">
              1500
            </Text>
          </Box>
          <Box width={200}>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("pools.pool.liquidity.value")}
            </Text>
            <Text fs={14} lh={18} color="white" mb={2}>
              152 BSX | 200 DAI
            </Text>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              $2000
            </Text>
          </Box>
          <Box width={80}>
            <Text fs={12} lh={14} color="neutralGray500">
              {t("pools.pool.liquidity.possibleAp")}
            </Text>
            <Text fs={14} lh={18} color="white">
              10-40%
            </Text>
          </Box>
        </Box>
      </Box>
      <Box p="0 15px 18px">
        <PoolSharesPositions />
      </Box>
    </Box>
  )
}
