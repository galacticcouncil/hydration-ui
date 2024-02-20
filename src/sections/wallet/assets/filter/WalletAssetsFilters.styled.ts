import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SButtonContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 8px;

  margin-left: -12px;
  margin-right: -12px;
  padding: 0 12px;

  overflow-x: auto;

  ${theme.scrollbarHidden};

  @media ${theme.viewport.gte.sm} {
    margin-left: 0;
    margin-right: 0;
    padding: 0;
  }
`

export const SButton = styled(Button)`
  @media ${theme.viewport.gte.sm} {
    min-width: 140px;
  }
`

export const SSearchContainer = styled.div`
  position: relative;

  & > svg {
    position: absolute;

    top: 50%;
    left: 12px;

    transform: translateY(-50%);

    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  input[type="text"] {
    background: rgba(158, 167, 186, 0.06);

    &:not(:hover):not(:focus) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    padding-left: 48px;

    &::placeholder {
      color: rgba(${theme.rgbColors.white}, 0.4);
    }
  }
`
