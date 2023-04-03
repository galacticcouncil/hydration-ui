import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as Tooltip from "@radix-ui/react-tooltip"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SClaimAllButton = styled(Tooltip.Trigger)`
  all: unset;

  border-radius: 4px;

  background: #fc3f8c;
  color: ${theme.colors.white};

  transition: background ${theme.transitions.default};

  border: 1px solid transparent;

  padding: 14px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  cursor: pointer;

  overflow: hidden;
  position: relative;

  &[data-state="delayed-open"],
  &[data-state="instant-open"] {
    border-radius: 4px 4px 0 0;
  }

  ${({ disabled }) =>
    disabled &&
    css`
      background: rgba(${theme.rgbColors.basic100}, 0.06);
      color: ${theme.colors.darkBlue300};

      border: 1px solid ${theme.colors.darkBlue300};

      pointer-events: none;
      cursor: not-allowed;
    `}
`

export const SContent = styled(motion.div)`
  border-radius: 4px 0px 4px 4px;

  box-shadow: 0px 50px 44px rgba(0, 0, 0, 0.54);

  background: linear-gradient(
      359.21deg,
      #111320 -1.12%,
      #f6297c 77.53%,
      #fc3f8c 94.14%
    ),
    #111320;

  z-index: ${theme.zIndices.toast};
`
