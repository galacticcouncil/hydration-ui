import { Flex, Paper, Text, ValueStats } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { ResponsiveContainer, Sankey, Tooltip } from "recharts"

import { CustomSankeyLink } from "@/modules/stats/fees/FeeFlowChart/CustomSankeyLink"
import { CustomSankeyNode } from "@/modules/stats/fees/FeeFlowChart/CustomSankeyNode"
import { CustomSankeyTooltip } from "@/modules/stats/fees/FeeFlowChart/CustomSankeyTooltip"
import { SANKEY_DATA } from "@/modules/stats/fees/FeeFlowChart/FeeFlowChart.utils"

export const FeeFlowChart = () => {
  const { t } = useTranslation("stats")
  const { isMobile } = useBreakpoints()

  return (
    <Flex as={Paper} direction="column" gap="xl" height={600} p="xl">
      <Flex align="flex-start" mb="m" asChild>
        <ValueStats
          label={t("fees.sankey.title")}
          customValue={
            <Text fs="h6" fw={700} font="primary" lh={1} color="text.high">
              {t("fees.sankey.description")}
            </Text>
          }
          wrap
        />
      </Flex>

      <Flex flex={1} sx={{ minHeight: pxToRem(420) }} asChild>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={SANKEY_DATA}
            node={<CustomSankeyNode />}
            link={<CustomSankeyLink />}
            nodePadding={24}
            nodeWidth={14}
            margin={
              isMobile
                ? { top: 8, right: 72, bottom: 8, left: 72 }
                : { top: 10, right: 72, bottom: 10, left: 100 }
            }
          >
            <Tooltip content={<CustomSankeyTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </Flex>
    </Flex>
  )
}
