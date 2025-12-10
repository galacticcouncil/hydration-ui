import {
  Flex,
  Skeleton,
  Text,
  TextProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { MouseEventHandler, ReactNode } from "react"

export type SummaryRowProps = {
  label: ReactNode
  content: ReactNode
  description?: string
  tooltip?: ReactNode
  className?: string
  loading?: boolean
  onClick?: MouseEventHandler
}

export const SummaryRow = ({
  label,
  content,
  description,
  tooltip,
  className,
  loading,
  onClick,
}: SummaryRowProps) => {
  const renderTooltip = (body: ReactNode) =>
    tooltip ? (
      <Tooltip text={tooltip} side="left" asChild>
        {body}
      </Tooltip>
    ) : (
      body
    )

  return renderTooltip(
    <Flex
      sx={{ ...(onClick && { cursor: "pointer" }) }}
      align="center"
      justify="space-between"
      my={8}
      className={className}
      onClick={onClick}
    >
      <Flex direction="column" justify="space-between" gap={4}>
        {typeof label === "string" ? (
          <SummaryRowLabel>{label}:</SummaryRowLabel>
        ) : (
          label
        )}

        {description && (
          <Text fs="p6" fw={400} color={getToken("text.low")}>
            {description}
          </Text>
        )}
      </Flex>

      {loading ? (
        <SummaryRowValue>
          <Skeleton width={50} height="1em" />
        </SummaryRowValue>
      ) : typeof content === "string" ? (
        <SummaryRowValue>{content}</SummaryRowValue>
      ) : (
        content
      )}
    </Flex>,
  )
}

export const SummaryRowValue = (props: TextProps) => (
  <Text fs="p5" fw={500} lh={1.2} color={getToken("text.high")} {...props} />
)

export const SummaryRowLabel = (props: TextProps) => (
  <Text fs="p5" lh={1.4} color={getToken("text.medium")} {...props} />
)
