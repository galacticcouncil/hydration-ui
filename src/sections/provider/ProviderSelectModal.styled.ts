import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { theme } from "theme"

export const SCircle = styled.span`
  display: block;
  width: 16px;
  height: 16px;

  border-radius: 9999px;
  background: ${theme.colors.basic900};
  border: 1px solid rgba(${theme.rgbColors.alpha0}, 0.3);

  transition: all ${theme.transitions.default};
  flex-shrink: 0;
`
export const SItem = styled.div<{ isActive?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "name url" "status url";
  gap: 24px;
  row-gap: 8px;

  padding: 14px var(--modal-body-padding-x);
  cursor: pointer;

  &:hover ${SCircle} {
    background: ${theme.colors.basic800};
  }

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: 2fr 1fr 3fr;
    grid-template-areas: "name status url";
  }

  ${(props) => {
    if (props.isActive) {
      return css`
        ${SCircle} {
          border-color: ${theme.colors.pink600};
        }

        &:hover ${SCircle} {
          background: ${theme.colors.basic800};
        }
      `
    }

    return null
  }}
`
export const SHeader = styled(SItem)`
  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  color: ${theme.colors.basic700};

  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;

  padding: 6px var(--modal-body-padding-x);
`
export const SContainer = styled.div`
  margin: 0 calc(-1 * var(--modal-body-padding-x));
  margin-top: 20px;
`

export const SButton = styled(motion.div)`
  position: relative;
  width: min-content;

  margin-left: auto;
  margin-bottom: 16px;

  display: flex;
  align-items: center;

  padding: 4px 10px;

  border: 1px solid rgba(176, 219, 255, 0.2);
  border-radius: 4px;

  background: linear-gradient(
    180deg,
    rgba(0, 4, 29, 0.63) 0%,
    rgba(0, 4, 29, 0.252) 98.17%
  );
  backdrop-filter: blur(20px);

  cursor: pointer;

  @media ${theme.viewport.gte.sm} {
    position: fixed;
    bottom: 16px;
    right: 16px;

    margin: 0;
  }
`

export const SName = styled(motion.div)`
  display: flex;
  align-items: center;

  width: 0;
  overflow: hidden;

  color: ${theme.colors.white};
`
