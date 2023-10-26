import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { theme } from "theme"

export const SButtonContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 10px;

  margin-left: -12px;
  margin-right: -12px;
  padding: 0 12px;

  overflow-x: auto;

  @media ${theme.viewport.gte.sm} {
    margin-left: 0;
    margin-right: 0;
    padding: 0;

    overflow-x: visible;
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

    color: ${theme.colors.basic600};
  }

  input[type="text"] {
    padding-left: 48px;
  }
`
