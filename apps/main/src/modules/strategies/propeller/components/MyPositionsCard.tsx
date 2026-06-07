import {
  Box,
  Button,
  Flex,
  Paper,
  PositionCard,
  Separator,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { PropellerLogo } from "@/modules/strategies/propeller/components/PropellerLogo"

interface Props {
  /** pETH shares held by the user. */
  shares: number
  /** pETH → ETH exchange rate. */
  exchangeRate: number
  /** Strategy APY %. */
  apyPercent: number
  onWithdraw: () => void
}

export const MyPositionsCard = ({
  shares,
  exchangeRate,
  apyPercent,
  onWithdraw,
}: Props) => {
  const { t } = useTranslation(["propeller", "common"])

  const ethValue = shares * exchangeRate

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("positions.title")}
        </Text>
      </Box>
      <Separator />
      <Flex direction="column" gap="m" p="m">
        <PositionCard
          logo={<PropellerLogo size={32} />}
          symbol={t("strategy.collateralAsset")}
          stats={
            <>
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label={t("positions.col.amount")}
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {t("common:currency", {
                      value: shares,
                      symbol: "pETH",
                    })}
                  </Text>
                }
                bottomLabel={t("common:currency", {
                  value: ethValue,
                  symbol: "ETH",
                })}
              />
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label={t("positions.col.netApy")}
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {t("common:percent", {
                      value: apyPercent,
                    })}
                  </Text>
                }
              />
            </>
          }
          cta={
            <Button variant="tertiary" size="small" onClick={onWithdraw}>
              {t("positions.action.withdraw")}
            </Button>
          }
        />
      </Flex>
    </Paper>
  )
}
