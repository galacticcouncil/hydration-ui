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

  @media (${theme.viewport.gte.sm}) {
    display: grid;
    align-items: end;
    grid-template-columns: 3fr 2fr;
    grid-column-gap: 16px;
    padding: 22px 44px;
    border: none;
    background: rgba(${theme.rgbColors.darkBlue401}, 0.8);
  }
`

export const SButton = styled(Button)`
  width: 100%;

  background: rgba(${theme.rgbColors.red100}, 0.25);
  border: 1px solid ${theme.colors.red400};
  color: ${theme.colors.red400};

  @media (${theme.viewport.gte.sm}) {
    max-width: 220px;
  }
`
