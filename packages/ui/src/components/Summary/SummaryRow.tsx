import { Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"

export type RowModel = {
  label: string
  content: ReactNode | string
  description?: string
  className?: string
  loading?: boolean
}

export const SummaryRow = ({
  label,
  content,
  description,
  className,
  loading,
}: RowModel) => {
  return (
    <Flex align="center" justify="space-between" my={8} className={className}>
      <Flex direction="column" justify="space-between" gap={4}>
        <Text fs="p5" color={getToken("text.medium")}>
          {label}
        </Text>

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

export const SummaryRowValue = ({ children }: { children: ReactNode }) => (
  <Text fs="p5" fw={500} color={getToken("text.high")}>
    {children}
  </Text>
)
