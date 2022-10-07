import styled from "@emotion/styled"
import { theme } from "theme"
import { motion } from "framer-motion"

export const SProgressContainer = styled.div`
  position: absolute;
  height: 32px;
  width: 100%;
  bottom: 0;
  left: 0;
  right: 0;

  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  overflow: hidden;

  pointer-events: none;
`
export const SProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
`
export const SProgressTime = styled.span`
  color: ${theme.colors.primary300};
`
export const SProgressBarValue = styled.div`
  width: 100%;
  height: 3px;
  background: ${theme.colors.primary500};
`
