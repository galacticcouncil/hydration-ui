import { Box, Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { SankeyLinkPayload } from "@/modules/stats/fees/FeeFlowChart/CustomSankeyLink"

type SankeyTooltipProps = {
  active?: boolean
  payload?: Array<{
    payload: SankeyLinkPayload & {
      source?: { name: string }
      target?: { name: string }
    }
  }>
}

export const CustomSankeyTooltip = ({
  active,
  payload,
}: SankeyTooltipProps) => {
  const { t } = useTranslation("stats")
  if (!active || !payload || !payload.length) return null

  const data = payload[0]?.payload
  if (!data?.source || !data?.target) return null

  return (
    <Box
      bg="surfaces.containers.low.primary"
      p="s"
      borderRadius="m"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="details.borders"
    >
      <Text fs="p5" fw={500} color="text.high">
        {data.source.name} → {data.target.name}
      </Text>
      <Text fs="p6" fw={500} color="text.medium">
        {t("fees.sankey.tooltip.value", { value: data.value ?? 0 })}
      </Text>
    </Box>
  )
}
