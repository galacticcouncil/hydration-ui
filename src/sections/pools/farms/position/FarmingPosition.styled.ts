import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 14px;

  width: 100%;

  padding: 20px 16px;

  background: #0e1321;

  border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);
  border-radius: ${theme.borderRadius.default}px;

  box-shadow: 0px -4px 8px 0px rgba(6, 9, 23, 0.7);

  @media (${theme.viewport.gte.sm}) {
    padding: 20px 30px;
    height: 312px;
  }
`

export const SSeparator = styled(Separator)`
  background: rgba(${theme.rgbColors.white}, 0.06);
`

export const SValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-self: center;
  justify-content: space-between;

  width: 100%;
`
