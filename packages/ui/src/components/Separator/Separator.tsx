import * as RadixSeparator from "@radix-ui/react-separator"
import { ResponsiveStyleValue } from "@theme-ui/css"
import React from "react"

import { Box, BoxProps } from "@/components/Box"
import { useResponsiveValue } from "@/styles/media"
import { getToken } from "@/utils"

type SeparatorOwnProps = {
  size?: number
  orientation?: ResponsiveStyleValue<"horizontal" | "vertical">
}

export type SeparatorProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadixSeparator.Root>,
  "orientation"
> &
  BoxProps &
  SeparatorOwnProps

export const Separator: React.FC<SeparatorProps> = ({
  size = 1,
  bg,
  ...props
}) => {
  const orientation = useResponsiveValue(props.orientation)
  return (
    <RadixSeparator.Root {...props} orientation={orientation} asChild>
      <Box
        width={orientation === "vertical" ? size : "auto"}
        height={orientation === "vertical" ? "auto" : size}
        bg={bg || getToken("details.separators")}
      />
    </RadixSeparator.Root>
  )
}
