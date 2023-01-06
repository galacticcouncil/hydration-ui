import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SSwitch = styled.div`
  position: relative;
  z-index: ${theme.zIndices.boxSwitch};

  display: flex;

  background: rgba(${theme.rgbColors.white}, 0.12);
  padding: 5px;
  border-radius: 4px;

  gap: 9px;

  left: 50%;
  transform: translate(-50%, 0);

  width: max-content;
`

export const SButton = styled.button<{ isActive: boolean }>`
  all: unset;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 4px;

  font-weight: 700;
  font-size: 12px;

  padding: 2px 18px;
  line-height: 32px;

  text-transform: uppercase;

  position: relative;

  ${({ isActive }) => {
    if (isActive) {
      return { color: theme.colors.white }
    }

    return { color: theme.colors.brightBlue100 }
  }};
`

export const SButtonBackground = styled(motion.span)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: -1;

  display: block;

  background: ${theme.colors.pink700};
  border-radius: 4px;
`
