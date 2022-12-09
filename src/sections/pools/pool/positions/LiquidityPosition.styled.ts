import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 80px;

  width: 100%;

  background: rgba(${theme.rgbColors.darkBlue401}, 0.8);

  border-radius: 4px;

  @media (${theme.viewport.gte.sm}) {
    padding: 22px 44px;
  }
`

export const SButton = styled(Button)`
  background: rgba(${theme.rgbColors.red100}, 0.25);
  border: 1px solid ${theme.colors.red400};
  color: ${theme.colors.red400};
`
