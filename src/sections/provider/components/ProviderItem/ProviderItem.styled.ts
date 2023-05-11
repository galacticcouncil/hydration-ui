import { css } from "@emotion/react"
import styled from "@emotion/styled"
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

  padding: 14px var(--modal-content-padding);
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
