import styled from "@emotion/styled"
import { Trigger } from "@radix-ui/react-dropdown-menu"
import { Link } from "@tanstack/react-location"
import { motion } from "framer-motion"

import { theme } from "theme"

export const SContainer = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
`

export const SButton = styled(Trigger)`
  all: unset;

  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;

  padding: 9px 14px;
  gap: 14px;

  color: ${theme.colors.white};
  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);

  cursor: pointer;

  border-radius: 4px;

  transition: ${theme.transitions.slow};

  :active,
  :hover {
    background: rgba(${theme.rgbColors.brightBlue100}, 0.12);
  }

  :active {
    outline: 1px solid ${theme.colors.brightBlue300};
  }
`

export const SContent = styled(motion.div)`
  --modal-header-padding-y: 14px;
  --modal-header-padding-x: 20px;
  --modal-header-btn-size: 26px;
  --modal-header-height: calc(
    var(--modal-header-btn-size) + var(--modal-header-padding-y) * 2
  );
  --modal-content-padding: 20px;

  width: 360px;

  background: ${theme.colors.darkBlue801};
  box-shadow: 0px 28px 82px rgba(0, 0, 0, 0.74);
  border-radius: 8px;

  backdrop-filter: blur(40px);
  z-index: ${theme.zIndices.toast};
  overflow: hidden;
`

export const SItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 8px 16px;
`

export const SItem = styled(Link)`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: 16px;
  align-items: center;

  padding: 21px 18px;

  background: rgba(0, 1, 7, 0.6);
  border-radius: 4px;

  color: rgba(133, 209, 255, 0.2);
  cursor: pointer;

  &:hover {
    color: rgba(133, 209, 255, 0.4);
  }
`
