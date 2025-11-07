import {
  Flex,
  Skeleton,
  Text,
  TextProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"

export type SummaryRowProps = {
  label: string
  content: ReactNode
  description?: string
  tooltip?: ReactNode
  className?: string
  loading?: boolean
}

export const SummaryRow = ({
  label,
  content,
  description,
  tooltip,
  className,
  loading,
}: SummaryRowProps) => {
  const labelElement = (
    <Text fs="p5" color={getToken("text.medium")}>
      {label}:
    </Text>
  )

  return (
    <Flex align="center" justify="space-between" my={8} className={className}>
      <Flex direction="column" justify="space-between" gap={4}>
        {tooltip ? (
          <Tooltip text={tooltip}>{labelElement}</Tooltip>
        ) : (
          labelElement
        )}

        {description && (
          <Text fs="p6" fw={400} color={getToken("text.low")}>
            {description}
          </Text>
        )}
      </Flex>

      {loading ? (
        <Skeleton width={50} height={12} />
      ) : typeof content === "string" ? (
        <SummaryRowValue>{content}</SummaryRowValue>
      ) : (
        content
      )}
    </Flex>
  )
}

export const SummaryRowValue = (props: TextProps) => (
  <Text fs="p5" fw={500} color={getToken("text.high")} {...props} />
)
