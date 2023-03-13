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

export const SButton = styled.button`
  all: unset;

  position: fixed;
  bottom: 4px;
  right: 4px;

  color: ${theme.colors.white};

  display: flex;
  align-items: center;
  font-size: 11px;

  cursor: pointer;

  gap: 12px;
`
