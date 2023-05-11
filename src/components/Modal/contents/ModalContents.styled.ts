import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled.div<{ animating: boolean }>`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;

  flex: 1;
  overflow: hidden;

  ${({ animating }) =>
    animating &&
    css`
      ${SContent} {
        overflow: hidden !important;
      }
    `}
`

export const SContent = styled(motion.div)<{ noPadding?: boolean }>`
  ${({ noPadding }) =>
    !noPadding &&
    "padding: 0 var(--modal-content-padding) var(--modal-content-padding);"}

  overflow: auto;

  z-index: ${theme.zIndices.modal};

  display: flex;
  flex-direction: column;
`
