import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: max-content 1fr;

  @media ${theme.viewport.lt.sm} {
    height: 100%;
  }
`

export const SContent = styled(motion.div)<{ noPadding?: boolean }>`
  ${({ noPadding }) =>
    !noPadding &&
    "padding: 0 var(--modal-content-padding) var(--modal-content-padding);"}

  @media ${theme.viewport.lt.sm} {
    flex: 1;
  }
`
