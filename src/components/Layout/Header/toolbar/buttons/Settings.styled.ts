import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ButtonTransparent } from "components/Button/Button"
import { m as motion } from "framer-motion"
import { theme } from "theme"

export const SHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 21px;
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

export const SItem = styled(ButtonTransparent)`
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
export const SMaskContainer = styled.div<{ cropped: boolean }>`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ cropped }) =>
    cropped &&
    css`
      -webkit-mask: radial-gradient(
        40% 40% at 65% 35%,
        transparent 25%,
        white 25%
      );
      mask: radial-gradient(40% 40% at 65% 35%, transparent 25%, white 25%);
    `}
`

export const SIndicator = styled.div`
  width: 5px;
  height: 5px;

  position: absolute;
  top: 11px;
  right: 11px;

  background: ${theme.colors.primaryA15};
  border-radius: 9999px;
`
