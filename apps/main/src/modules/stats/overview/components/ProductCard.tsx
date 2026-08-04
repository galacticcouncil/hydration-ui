import { Text, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  SCard,
  SIconWrapper,
  SMetricsGrid,
} from "@/modules/stats/overview/components/ProductCards.styled"

type ProductMetric = {
  label: string
  value: React.ReactNode
}

type ProductCardProps = {
  title: string
  desc: string
  icon: string
  span: number
  metrics: ProductMetric[]
  isLoading: boolean
}

export const ProductCard = ({
  title,
  desc,
  icon,
  span,
  metrics,
  isLoading,
}: ProductCardProps) => {
  return (
    <SCard $span={span} direction="column">
      <SIconWrapper>
        <img src={icon} alt={title} />
      </SIconWrapper>
      <Text font="primary" fs="h6" fw={500} mb={4}>
        {title}
      </Text>
      <Text fs="p4" color={getToken("text.low")} mb={20}>
        {desc}
      </Text>

      <SMetricsGrid>
        {metrics.map((m) => (
          <ValueStats
            key={m.label}
            label={m.label}
            value={typeof m.value === "string" ? m.value : undefined}
            customValue={typeof m.value === "string" ? undefined : m.value}
            isLoading={isLoading}
            size="medium"
            wrap={true}
          />
        ))}
      </SMetricsGrid>
    </SCard>
  )
}
