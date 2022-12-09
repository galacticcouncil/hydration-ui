import styled from "@emotion/styled"
import { theme } from "theme"
import { ReactComponent as InfoIcon } from "assets/icons/InfoIcon.svg"

export const SInfoIcon = styled(InfoIcon)`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;
  flex-shrink: 0;

  color: ${theme.colors.pink600};
  background: transparent;
  border: 1px solid ${theme.colors.pink600};

  transition: all ${theme.transitions.default};

  border-radius: 9999px;

  [data-state*="open"] > & {
    color: ${theme.colors.basic900};
    background: ${theme.colors.pink600};
    border-color: ${theme.colors.pink600};
  }
`
