import { Box } from "components/Box/Box";
import { GradientText } from "components/Typography/GradientText/GradientText";
import { Text } from "components/Typography/Text/Text";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { FarmingPositions } from "./FarmingPositions/FarmingPositions";

type LiquiditySharesProps = {};

export const LiquidityShares: FC<LiquiditySharesProps> = () => {
  const { t } = useTranslation();
  return (
    <Box bg={"black"}>
      <Box p="22px 60px 34px 25px">
        <GradientText
          text={t("farmsPoolsPage.poolCard.liquidity.title")}
          mb={11}
        />
        <Box flex spread>
          <Box width={220}>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("farmsPoolsPage.poolCard.liquidity.unstakedShares")}
            </Text>
            <Text fs={14} lh={18} color="white">
              1500
            </Text>
          </Box>
          <Box width={200}>
            <Text fs={12} lh={14} color="neutralGray500" mb={6}>
              {t("farmsPoolsPage.poolCard.liquidity.value")}
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
              {t("farmsPoolsPage.poolCard.liquidity.possibleAp")}
            </Text>
            <Text fs={14} lh={18} color="white">
              10-40%
            </Text>
          </Box>
        </Box>
      </Box>
      <Box p="0 15px 18px">
        <FarmingPositions />
      </Box>
    </Box>
  );
};
