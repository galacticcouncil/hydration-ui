import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SPositions = styled.div`
  background: rgba(${theme.rgbColors.darkBlue900}, 0.4);
  width: 100%;
  padding: 20px 12px;

  @media ${theme.viewport.gte.sm} {
    padding: 20px 30px;
  }
`

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  background: rgba(${theme.rgbColors.primaryA0}, 0.35);
  border: 1px solid rgba(114, 131, 165, 0.6);

  border-radius: 4px;
  padding: 20px;

  @media ${theme.viewport.gte.sm} {
    display: grid;
    align-items: end;
    grid-template-columns: 5fr 2fr;
    grid-column-gap: 16px;
    border: 1px solid rgba(114, 131, 165, 0.6);
    background: rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
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
