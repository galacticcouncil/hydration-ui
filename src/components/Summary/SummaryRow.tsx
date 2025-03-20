import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"

export type RowModel = {
  label: ReactNode | string
  content: ReactNode | string
  description?: string
}

type SummaryRowProps = RowModel & {
  withSeparator?: boolean
}

export const SummaryRow = ({
  label,
  content,
  description,
  withSeparator,
}: SummaryRowProps) => {
  return (
    <>
      <div sx={{ flex: "row", justify: "space-between", my: 8 }}>
        <div
          sx={{
            flex: "column",
            justify: "space-between",
            gap: 6,
          }}
        >
          <div>
            {typeof label === "string" ? (
              <Text color="basic400" fs={14} tAlign="left">
                {label}
              </Text>
            ) : (
              label
            )}
          </div>

          {description && (
            <Text color="darkBlue300" fs={12} lh={15}>
              {description}
            </Text>
          )}
        </div>
        <div>
          {typeof content === "string" ? (
            <Text fs={14} color="white" tAlign="right">
              {content}
            </Text>
          ) : (
            content
          )}
        </div>
      </div>
      {withSeparator && <Separator color="darkBlue401" />}
    </>
  )
}
