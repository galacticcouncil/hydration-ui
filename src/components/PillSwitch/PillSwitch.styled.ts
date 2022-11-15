import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SSwitch = styled.div`
  position: relative;
  z-index: ${theme.zIndices.boxSwitch};

  display: flex;
  gap: var(--btn-gap);

  background: rgba(${theme.rgbColors.white}, 0.12);
  padding: 5px;
  border-radius: 9999px;

  gap: 9px;

  --padding-y: 0px;

  @media ${theme.viewport.gte.sm} {
    --padding-y: 4px;
  }
`

export const SButton = styled.button<{ isActive: boolean }>`
  all: unset;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  font-weight: 700;
  font-size: 12px;

  padding: var(--padding-y) 18px;
  line-height: 24px;

  text-transform: uppercase;

  position: relative;

  ${({ isActive }) => {
    if (isActive) {
      return { color: theme.colors.backgroundGray1000 }
    }

    return { color: theme.colors.neutralGray500 }
  }}
`

export const SButtonBackground = styled(motion.span)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: -1;

  display: block;

  background: ${theme.gradients.primaryGradient};
  border-radius: 9999px;
`
