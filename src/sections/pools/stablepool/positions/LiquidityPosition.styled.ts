import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  border: 1px solid ${theme.colors.vibrantBlue300};
  background: rgba(${theme.rgbColors.primaryA0}, 0.35);

  border-radius: 4px;
  padding: 20px;

  @media ${theme.viewport.gte.sm} {
    display: grid;
    align-items: end;
    grid-template-columns: 5fr 2fr;
    grid-column-gap: 16px;
    background: rgba(0, 7, 50, 0.7);
  }
`

export const SButton = styled(Button)`
  width: 100%;

  background: rgba(${theme.rgbColors.red100}, 0.25);
  border: 1px solid ${theme.colors.red400};
  color: ${theme.colors.red400};

  &:not(:disabled) {
    :hover {
      background: rgba(${theme.rgbColors.redA300}, 0.39);
      color: ${theme.colors.red400};
      border: 1px solid ${theme.colors.red300};
    }

    :active {
      background: ${theme.colors.red500};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.red300};
    }
  }

  @media ${theme.viewport.gte.sm} {
    max-width: 220px;
  }
`
