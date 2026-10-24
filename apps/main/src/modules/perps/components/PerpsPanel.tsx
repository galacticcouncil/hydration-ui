import { Box, Stack, Text } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"

/**
 * Shared body height so the chart and order book line up as one row rather
 * than ending at different points.
 */
export const PERPS_BODY_HEIGHT = 440

/**
 * Terminal-style container for the perps module: tight padding, hairline
 * border and a squared-off corner, rather than the app's rounded cards. Keeps
 * the panels reading as one dense trading surface.
 */
export const PerpsPanel: FC<{
  title?: string
  action?: ReactNode
  children: ReactNode
}> = ({ title, action, children }) => (
  <Box
    sx={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 6,
      padding: 12,
    }}
  >
    <Stack gap="s">
      {(title || action) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 8,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {title && (
            <Text
              fs="p6"
              fw={600}
              transform="uppercase"
              sx={{ letterSpacing: "0.08em", opacity: 0.7 }}
            >
              {title}
            </Text>
          )}
          {action}
        </Box>
      )}
      {children}
    </Stack>
  </Box>
)

/** Label/value row with the value in mono so columns line up down the panel. */
export const PerpsStatRow: FC<{
  label: string
  value: string
  color?: string
}> = ({ label, value, color }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
    <Text fs="p6" sx={{ opacity: 0.7 }}>
      {label}
    </Text>
    <Text fs="p6" font="mono" fw={600} color={color}>
      {value}
    </Text>
  </Box>
)
