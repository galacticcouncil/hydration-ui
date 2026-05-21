import {
  Box,
  Button,
  Flex,
  Paper,
  Separator,
  Text,
  Tooltip,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  FAKE_POSITION,
  STABLE_BONDS_ASSET_ID,
} from "@/modules/strategies/stable-bonds/constants"

export const MyPositionsCard = () => {
  const { t } = useTranslation("common")
  const position = FAKE_POSITION

  return (
    <Paper>
      <Box p="l">
        <Text as="h2" font="primary" fs="base" fw={500}>
          My positions
        </Text>
      </Box>
      <Separator />
      <Box p="m">
        <Paper p="l" shadow={false}>
          <Flex align="center" gap="l" wrap>
            <Flex align="center" gap="s" minWidth={120}>
              <AssetLogo id={STABLE_BONDS_ASSET_ID} size="medium" />
              <Text fs="p3" fw={500} color={getToken("text.high")}>
                HOLLARb
              </Text>
            </Flex>

            <Flex
              align="center"
              justify="space-around"
              gap="xxl"
              px="xl"
              flex={1}
              sx={{ minWidth: 0 }}
            >
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label="Initial paid"
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {t("currency", {
                      value: position.initialPaidAmount,
                      symbol: position.initialPaidSymbol,
                    })}
                  </Text>
                }
                bottomLabel={t("currency", {
                  value: position.initialPaidUsd,
                })}
              />
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label="Receive"
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {t("currency", {
                      value: position.receiveAmount,
                      symbol: position.receiveSymbol,
                    })}
                  </Text>
                }
                bottomLabel={t("currency", {
                  value: position.receiveUsd,
                })}
              />
              <ValueStats
                wrap
                size="small"
                font="secondary"
                label="Maturity date"
                customValue={
                  <Text fs="p3" fw={500} lh={1}>
                    {position.maturityDate}
                  </Text>
                }
                bottomLabel={`${position.daysLeft} days left`}
              />
              <ValueStats
                wrap
                size="small"
                font="secondary"
                customLabel={
                  <Flex align="center" gap="xs">
                    <Text fs="p5" color={getToken("text.medium")}>
                      Net APR
                    </Text>
                    <Tooltip text="Annual percentage return net of fees, based on the bond purchase discount and time to maturity." />
                  </Flex>
                }
                customValue={
                  <Text
                    fs="p3"
                    fw={500}
                    lh={1}
                    color={getToken("accents.success.emphasis")}
                  >
                    {t("percent", {
                      value: position.netApr,
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                }
              />
            </Flex>

            <Flex direction="column" align="flex-end" gap="xs" minWidth={140}>
              <Button variant="tertiary" size="small" disabled>
                Redeem
              </Button>
              <Text fs="p6" color={getToken("text.low")}>
                Available at maturity
              </Text>
            </Flex>
          </Flex>
        </Paper>
      </Box>
    </Paper>
  )
}
