import { InformationCircleIcon } from "@heroicons/react/outline"
import { Box, Link, SvgIcon, useTheme } from "@mui/material"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"

const contentSx = {
  borderRadius: "4px",
  display: "inline-flex",
  alignItems: "center",
  p: "2px",
  mt: "2px",
  cursor: "pointer",
  "&:hover": { opacity: 0.6 },
}

interface InfoIconProps {
  color?: string
}
const InfoIcon = ({ color }: InfoIconProps) => (
  <SvgIcon
    sx={{
      ml: "3px",
      color: color ? color : "text.muted",
      fontSize: "14px",
    }}
  >
    <InformationCircleIcon />
  </SvgIcon>
)
export const IsolatedEnabledBadge = () => {
  const theme = useTheme()

  const sx = {
    border: `1px solid ${theme.palette.warning.main}`,
    color: theme.palette.warning.main,
    ...contentSx,
  }
  return (
    <ContentWithTooltip
      withoutHover
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <span>
              Isolated assets have limited borrowing power and other assets
              cannot be used as collateral.
            </span>
          }
        />
      }
    >
      <Box sx={sx}>
        <Text fs={14} color="warning300">
          Isolated
        </Text>
        <InfoIcon sx={{ color: "warning300" }} />
      </Box>
    </ContentWithTooltip>
  )
}

export const IsolatedDisabledBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <span>
              Asset can be only used as collateral in isolation mode with
              limited borrowing power. To enter isolation mode, disable all
              other collateral.
            </span>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Text fs={14} color="red400">
          <span>Unavailable</span>
        </Text>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  )
}

export const UnavailableDueToIsolationBadge = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <IsolationModeTooltipTemplate
          content={
            <span>Collateral usage is limited because of isolation mode.</span>
          }
        />
      }
    >
      <Box sx={contentSx}>
        <Text color="red400">Unavailable</Text>
        <InfoIcon />
      </Box>
    </ContentWithTooltip>
  )
}

const IsolationModeTooltipTemplate = ({ content }: { content: ReactNode }) => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>{content}</Box>
      <Text fs={12}>
        <span>
          Learn more in our{" "}
          <Link
            href="https://docs.aave.com/faq/aave-v3-features#isolation-mode"
            fontWeight={500}
          >
            FAQ guide
          </Link>
        </span>
      </Text>
    </Box>
  )
}
