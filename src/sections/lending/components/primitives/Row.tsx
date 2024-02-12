import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { theme } from "theme"

type RowProps = {
  captionColor?: keyof typeof theme.colors
  align?: "center" | "start" | "end"
  className?: string
  caption?: ReactNode
  children: ReactNode
}

export const Row = ({
  caption,
  children,
  captionColor,
  align = "center",
  className,
}: RowProps) => {
  return (
    <div
      className={className}
      sx={{
        flex: "row",
        align,
        justify: "space-between",
      }}
    >
      {caption && <span sx={{ mr: 8, color: captionColor }}>{caption}</span>}
      {children}
    </div>
  )
}
