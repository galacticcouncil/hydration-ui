import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  height: 192px;

  background: #0e1321;
  border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);
  border-radius: ${theme.borderRadius.default}px;

  box-shadow: 0px -4px 8px 0px rgba(6, 9, 23, 0.7);

  padding: 16px;

  @media (${theme.viewport.gte.sm}) {
    padding: 20px;
    height: 162px;
  }
`

export const SWrapperContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 16px;

  position: relative;
  overflow: hidden;
`

export const SShadow = styled.div`
  position: absolute;
  bottom: 0px;
  z-index: 1;

  height: 50px;
  width: 100%;

  background: linear-gradient(180deg, rgba(6, 9, 23, 0) 9.93%, #060917 79.13%);
`
