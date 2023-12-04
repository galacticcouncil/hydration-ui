import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  background: rgba(${theme.rgbColors.primaryA0}, 0.35);
  border: 1px solid rgba(114, 131, 165, 0.6);

  border-radius: 4px;
  padding: 20px;
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
`
