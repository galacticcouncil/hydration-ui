import styled from "@emotion/styled"
import { IconButton } from "components/IconButton/IconButton"
import { m as motion } from "framer-motion"
import { theme } from "theme"

export const SModalContent = styled(motion.div)`
  position: absolute;
  right: 0;
  bottom: 0;

  width: 70%;
  max-width: 300px;

  margin: 20px 17px 1px 0;
  outline: 1px solid rgba(48, 52, 76, 0.5);

  border-radius: 4px;

  box-shadow: 1px -3px 100px rgba(68, 104, 199, 0.3);

  background: ${theme.colors.darkBlue700};

  :focus-visible {
    outline: none;
  }
`

export const SBackdrop = styled(motion.div)`
  width: 100%;
  height: 100vh;

  position: fixed;
  bottom: calc(60px + env(safe-area-inset-bottom));
  left: 0;
  z-index: ${theme.zIndices.modal};

  background: rgba(0, 7, 50, 0.7);
`

export const CloseButton = styled(IconButton)`
  color: ${theme.colors.white};
  background: ${theme.colors.darkBlue700};

  position: absolute;
  top: -16px;
  right: -8px;

  :focus-visible {
    outline: none;
  }
`
