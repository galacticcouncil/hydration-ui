import styled from "@emotion/styled"
import { theme } from "theme"

export const SCircle = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 14px;
  height: 14px;

  border-radius: 9999px;
  background: ${theme.colors.basic900};
  border: 1px solid rgba(${theme.rgbColors.alpha0}, 0.3);

  transition: all ${theme.transitions.default};
  flex-shrink: 0;
`

export const SCircleThumb = styled.div`
  width: 10px;
  height: 10px;

  background: ${theme.colors.pink600};

  border-radius: 9999px;
`

export const SItem = styled.div`
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
`
