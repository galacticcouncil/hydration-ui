import { FarmIcon } from "assets/icons/FarmIcon"
import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PositionsWrapper } from "sections/pools/pool/shares/positions/PoolSharesPositions.styled"
import { PoolSharesPositionsFarms } from "sections/pools/pool/shares/positions/farms/PoolSharesPositionsFarms"

export const PoolSharesPositions = () => {
  const { t } = useTranslation()

  return (
    <PositionsWrapper>
      <Box flex>
        <Icon icon={<FarmIcon />} mr={8} />
        <GradientText text={t("farmsPoolsPage.poolCard.positions.title")} />
      </Box>
      <Box flex>
        <Box flex spread grow mt={10}>
          <Box>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("farmsPoolsPage.poolCard.positions.positionTitle", {
                position: 1,
              })}
            </Text>
            <Text fs={14} lh={18} color="white" mb={2}>
              {t("farmsPoolsPage.poolCard.positions.positionValue", {
                date: "2.2.2022",
              })}
            </Text>
          </Box>
          <Box>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("farmsPoolsPage.poolCard.positions.lockedTitle")}
            </Text>
            <Text fs={14} lh={18} color="white" mb={2}>
              {t("farmsPoolsPage.poolCard.positions.lockedValue", {
                count: 150,
              })}
            </Text>
          </Box>
          <Box>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("farmsPoolsPage.poolCard.positions.currValueTitle")}
            </Text>
            <Text fs={14} lh={18} color="white" mb={2}>
              152 BSX | 200 DAI
            </Text>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              $2000
            </Text>
          </Box>
        </Box>
        <PoolSharesPositionsFarms />
      </Box>
    </PositionsWrapper>
  )
}
