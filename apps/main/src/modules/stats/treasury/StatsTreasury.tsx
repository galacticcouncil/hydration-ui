import { Box, Flex, Tooltip, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useTreasuryStatsData } from "@/api/treasury"
import { NetTreasuryTooltipContent } from "@/modules/stats/treasury/NetTreasuryTooltipContent"
import { StatsComposition } from "@/modules/stats/treasury/StatsComposition"
import { StatsTreasuryTable } from "@/modules/stats/treasury/StatsTreasuryTable"

export const StatsTreasury = () => {
  const { t } = useTranslation(["stats", "common"])
  const { data, isLoading } = useTreasuryStatsData()
  const { primary, others } = data?.assets ?? { primary: [], others: [] }

  return (
    <>
      <Flex direction="column" gap="m">
        <Box>
          <Tooltip
            text={<NetTreasuryTooltipContent data={data} />}
            sxContent={{ p: getToken("space.base") }}
          >
            <ValueStats
              wrap
              size="medium"
              label={t("treasury.netValue")}
              value={t("common:currency.compact", {
                value: data?.totalValueDisplay,
              })}
              isLoading={isLoading}
            />
          </Tooltip>
        </Box>

        <StatsComposition
          primary={primary}
          others={others}
          isLoading={isLoading}
        />
      </Flex>

      <StatsTreasuryTable
        primary={primary}
        others={others}
        isLoading={isLoading}
      />
    </>
  )
}
