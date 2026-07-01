import { css, Theme } from "@emotion/react"
import styled from "@emotion/styled"
import { Box, Stack } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import type { MultisigHistoryStatus } from "@/api/multisig"

const TIMELINE_RAIL_WIDTH = pxToRem(20)
const TIMELINE_DOT_SIZE = pxToRem(10)
const TIMELINE_LINE_WIDTH = pxToRem(2)
const TIMELINE_RAIL_CENTER = pxToRem(9)

const getTimelineDotStatusColor = (
  status: MultisigHistoryStatus,
  theme: Theme,
) => {
  switch (status) {
    case "rejected":
      return theme.accents.danger.emphasis
    case "proposed":
    case "approved":
      return theme.accents.info.onPrimary
    case "executed":
      return theme.accents.success.emphasis
  }
}

export const STimelineStack = styled(Stack)(
  ({ theme }) => css`
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: ${TIMELINE_RAIL_CENTER};
      top: ${TIMELINE_DOT_SIZE};
      bottom: ${TIMELINE_DOT_SIZE};
      width: ${TIMELINE_LINE_WIDTH};
      background-color: ${theme.details.separators};
    }
  `,
)

export const STimelineRow = styled(Box)(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: ${TIMELINE_RAIL_WIDTH} minmax(0, 1fr) auto auto auto;
    align-items: center;
    gap: ${theme.space.base};
  `,
)

export const STimelineDot = styled(Box)<{ status: MultisigHistoryStatus }>(
  ({ theme, status }) => css`
    position: relative;
    align-self: stretch;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${TIMELINE_DOT_SIZE};
      height: ${TIMELINE_DOT_SIZE};
      border-radius: ${theme.radii.full};
      background-color: ${getTimelineDotStatusColor(status, theme)};
      box-shadow: 0 0 0 3px ${theme.surfaces.themeBasePalette.surfaceHigh};
      z-index: 1;
    }
  `,
)
