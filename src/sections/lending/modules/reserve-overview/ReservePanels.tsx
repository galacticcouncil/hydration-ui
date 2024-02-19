import {
  Box,
  BoxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Text } from "components/Typography/Text/Text"
import type { Component, ComponentPropsWithoutRef, ReactNode } from "react"
import React from "react"

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      position: "relative",
      display: { xs: "block", md: "flex" },
      margin: "0 auto",
      ...props.sx,
    }}
  />
)
export const PanelTitle: React.FC<{
  children: ReactNode
  color?: ComponentPropsWithoutRef<typeof Text>["color"]
}> = ({ children, color }) => (
  <Text
    color={color}
    fs={14}
    sx={{
      mr: 16,
      mb: [12, 30],
    }}
  >
    {children}
  </Text>
)

interface PanelItemProps {
  title: ReactNode
  className?: string
  children?: ReactNode
}

export const PanelItem: React.FC<PanelItemProps> = ({
  title,
  children,
  className,
}) => {
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up("md"))

  return (
    <Box
      sx={{
        position: "relative",
        "&:not(:last-child)": {
          pr: 4,
          mr: 4,
        },
        ...(mdUp
          ? {
              "&:not(:last-child):not(.borderless)::after": {
                content: '""',
                height: "32px",
                position: "absolute",
                right: 4,
                top: "calc(50% - 17px)",
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }
          : {}),
      }}
      className={className}
    >
      <Typography color="text.secondary" component="span">
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          flex: 1,
          overflow: "hidden",
          py: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
