import { css } from "@emotion/react"
import React from "react"

import { Box, BoxProps } from "@/components/Box"
import { ContainerQueryType } from "@/styles/container"

export type ResponsiveScopeProps = Omit<BoxProps, "css"> & {
  name?: string
  type?: ContainerQueryType
}

export const ResponsiveScope: React.FC<ResponsiveScopeProps> = ({
  name,
  type = "inline-size",
  children,
  ...boxProps
}) => {
  const containerStyles = css`
    container-type: ${type};
    ${name ? `container-name: ${name};` : ""}
  `

  return (
    <Box css={containerStyles} {...boxProps}>
      {children}
    </Box>
  )
}
