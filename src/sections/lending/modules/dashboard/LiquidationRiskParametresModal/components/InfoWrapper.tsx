import { Box } from "@mui/material"
import { ReactNode } from "react"
import { Text } from "components/Typography/Text/Text"

interface InfoWrapperProps {
  topValue: ReactNode
  topTitle: ReactNode
  topDescription: ReactNode
  children: ReactNode
  bottomText: ReactNode
  color: string
}

export const InfoWrapper = ({
  topValue,
  topTitle,
  topDescription,
  children,
  bottomText,
  color,
}: InfoWrapperProps) => {
  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        mb: 6,
        borderRadius: "6px",
        px: 4,
        pt: 4,
        pb: 6,
        "&:last-of-type": {
          mb: 0,
        },
      })}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "calc(100% - 72px)" }}>
          <Text fs={16} color="white" sx={{ mb: 4 }}>
            {topTitle}
          </Text>
          <Text fs={14} color="basic300">
            {topDescription}
          </Text>
        </Box>

        <Box
          sx={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: color,
          }}
        >
          <Text fs={14} font="ChakraPetchBold">
            {topValue}
          </Text>
        </Box>
      </Box>

      <Box>{children}</Box>

      <Text fs={14} color="basic300">
        {bottomText}
      </Text>
    </Box>
  )
}
