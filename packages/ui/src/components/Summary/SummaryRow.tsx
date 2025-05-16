import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"

export type RowModel = {
  label: string
  content: ReactNode | string
  description?: string
  className?: string
}

export const SummaryRow = ({
  label,
  content,
  description,
  className,
}: RowModel) => {
  return (
    <Flex
      sx={{ justifyContent: "space-between", alignItems: "center", my: 8 }}
      className={className}
    >
      <Flex
        direction="column"
        sx={{
          gap: 4,
          justifyContent: "space-between",
        }}
      >
        <Text fs="p5" color={getToken("text.medium")}>
          {label}
        </Text>

        {description && <Text fs="p4">{description}</Text>}
      </Flex>

      {typeof content === "string" ? (
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
