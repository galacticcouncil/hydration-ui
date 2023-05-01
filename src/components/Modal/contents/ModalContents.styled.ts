import styled from "@emotion/styled"
import { motion } from "framer-motion"

export const SContainer = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;

  flex: 1;
  overflow: hidden;
`

export const SContent = styled(motion.div)<{ noPadding?: boolean }>`
  ${({ noPadding }) =>
    !noPadding &&
    "padding: 0 var(--modal-content-padding) var(--modal-content-padding);"}

  overflow: auto;
`
