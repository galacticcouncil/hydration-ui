import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, SummaryRowValue } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

export type ValueChangeProps = {
  from: ReactNode
  to: ReactNode
}

export const ValueChange: React.FC<ValueChangeProps> = ({ from, to }) => (
  <Flex gap="s" align="center">
    <SummaryRowValue>{from}</SummaryRowValue>
    <Icon size="xs" component={ArrowRight} />
    <SummaryRowValue>{to}</SummaryRowValue>
  </Flex>
)
