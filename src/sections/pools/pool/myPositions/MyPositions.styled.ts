import styled from "@emotion/styled"
import { m as motion } from "framer-motion"
import { theme } from "theme"

export const SPositionContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 14px;

  z-index: 1;

  width: 100%;

  padding: 20px 16px;

  background: #0e1321;

  border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);
  border-radius: ${theme.borderRadius.default}px;

  box-shadow: 0px -4px 8px 0px rgba(6, 9, 23, 0.7);

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 30px;
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
  bottom: -1px;
  z-index: 1;

  height: 50px;
  width: 100%;

  background: linear-gradient(180deg, rgba(6, 9, 23, 0) 9.93%, #060917 79.13%);
`
