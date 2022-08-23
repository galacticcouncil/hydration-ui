import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { Box } from "components/Box/Box"
import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { formatNum } from "utils/formatting"

const data = { title: "XYK Pool" }

export const PoolDetails = () => {
  const { t } = useTranslation()

  return (
    <Box flex column width={380}>
      <Box flex spread mb={40} ml={4}>
        <Box>
          <Text fs={14} lh={26} color="neutralGray400">
            {data.title}
          </Text>
          <Box flex acenter>
            <DualAssetIcons
              firstIcon={{
                icon: <BasiliskIcon />,
                withChainedIcon: true,
                chainedIcon: <BasiliskIcon />,
              }}
              secondIcon={{ icon: <BasiliskIcon />, withChainedIcon: true }}
            />
            <Box flex column gap={1}>
              <Text fw={700} color="white">
                LPT/LPT
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                Token/Token
              </Text>
            </Box>
          </Box>
        </Box>
        <Box flex column width={120} mt={5} align="start">
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.fee")}
          </Text>
          <Text lh={22} color="white">
            0.3%
          </Text>
        </Box>
      </Box>
      <Separator mb={34} />
      <Box flex spread ml={4} mb={36}>
        <Box>
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.valueLocked")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {"$" + formatNum(100000000)}
          </Text>
        </Box>
        <Box flex column width={120} align="start">
          <Text fs={14} color="neutralGray400" lh={22}>
            {t("farmsPoolsPage.poolCard.poolDetails.24hours")}
          </Text>
          <Text lh={22} color="white" fs={18}>
            {"$" + formatNum(1234.45)}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
