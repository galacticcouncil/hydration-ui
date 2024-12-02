import * as RadixSeparator from "@radix-ui/react-separator"
import React from "react"

import { Box, BoxProps } from "@/components/Box"
import { getToken } from "@/utils"

type SeparatorOwnProps = {
  size?: number
}

export type SeparatorProps = React.ComponentPropsWithoutRef<
  typeof RadixSeparator.Root
> &
  BoxProps &
  SeparatorOwnProps

export const Separator: React.FC<SeparatorProps> = ({ size = 1, ...props }) => (
  <RadixSeparator.Root {...props} asChild>
    <Box
      width={props.orientation === "vertical" ? size : "auto"}
      height={props.orientation === "vertical" ? "auto" : size}
      bg={getToken("Details.separators")}
    />
  </RadixSeparator.Root>
)
