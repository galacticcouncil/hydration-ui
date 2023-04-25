import styled from "@emotion/styled"
import { Label } from "@radix-ui/react-label"
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

export const SLabel = styled(Label)<{ error?: string }>`
  color: ${(p) => (p.error ? theme.colors.error : theme.colors.white)};
`

export const ErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
`

export const LabelWrapper = styled.div`
  font-size: 16px;
  line-height: 22px;
`
