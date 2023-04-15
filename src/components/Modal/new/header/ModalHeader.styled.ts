import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { motion } from "framer-motion"

export const SContainer = styled(motion.div)<{ centered: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  ${({ centered }) => centered && "right: 0;"}

  display: flex;
  align-items: center;
  justify-content: center;

  height: var(--modal-header-height);
  padding: 0 var(--modal-header-padding-x);
`

export const SButtonContainer = styled(motion.div)<{
  position: "left" | "right"
}>`
  position: absolute;
  top: var(--modal-header-padding-y);
  ${({ position }) => {
    if (position === "left") return "left: var(--modal-header-padding-x);"
    if (position === "right") return "right: var(--modal-header-padding-x);"
  }}
`

export const SButton = styled(IconButton)`
  width: var(--modal-header-btn-size);
  height: var(--modal-header-btn-size);
`
