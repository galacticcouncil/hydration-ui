import {
  Box,
  Flex,
  Skeleton,
  Text,
  TextProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { MouseEventHandler, ReactNode } from "react"

import { useBreakpoints } from "@/theme"

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
  const { isMobile } = useBreakpoints()

  const renderTooltip = (body: ReactNode) =>
    tooltip ? (
      <Tooltip text={tooltip} side="left" asChild>
        {body}
      </Tooltip>
    ) : (
      body
    )

  const renderLabel = () => {
    const labelContent =
      typeof label === "string" ? (
        <SummaryRowLabel>{label}:</SummaryRowLabel>
      ) : (
        label
      )

    return isMobile
      ? renderTooltip(
          <Box onClick={(e) => e.stopPropagation()}>{labelContent}</Box>,
        )
      : labelContent
  }

  const row = (
    <Flex
      sx={{ ...(onClick && { cursor: "pointer" }) }}
      align="center"
      justify="space-between"
      my="base"
      className={className}
      onClick={onClick}
    >
      <Flex direction="column" justify="space-between" gap="s">
        {renderLabel()}

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
    </Flex>
  )

  return isMobile ? row : renderTooltip(row)
}

export const SummaryRowValue = (props: TextProps) => (
  <Text fs="p5" fw={500} lh={1.2} color={getToken("text.high")} {...props} />
)

export const SummaryRowDisplayValue = (props: TextProps) => (
  <Text fs="p6" fw={500} lh={1.2} color={getToken("text.medium")} {...props} />
)

export const SummaryRowLabel = (props: TextProps) => (
  <Text fs="p5" lh={1.4} color={getToken("text.medium")} {...props} />
)
