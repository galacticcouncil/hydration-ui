import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Link } from "@tanstack/react-location"
import { ButtonTransparent } from "components/Button/Button"
import { m as motion } from "framer-motion"
import { theme } from "theme"

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

const itemStyles = css`
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

export const SItemLink = styled(Link)`
  ${itemStyles}
`
export const SItemButton = styled(ButtonTransparent)`
  ${itemStyles}
`
