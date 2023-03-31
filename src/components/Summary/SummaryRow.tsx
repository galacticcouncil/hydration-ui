import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"

export type RowModel = {
  label: string
  content: ReactNode | string
}

type SummaryRowProps = RowModel & {
  withSeparator?: boolean
}

export const SummaryRow = ({
  label,
  content,
  withSeparator,
}: SummaryRowProps) => {
  return (
    <>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          mt: 7,
          mb: 7,
        }}
      >
        <Text color="basic400" fs={14} tAlign="left">
          {label}
        </Text>
        {typeof content === "string" ? (
          <Text fs={14} color="white" tAlign="right">
            {content}
          </Text>
        ) : (
          content
        )}
      </div>
      {withSeparator && <Separator color="darkBlue401" />}
    </>
  )
}
