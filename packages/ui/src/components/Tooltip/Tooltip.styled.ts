import styled from "@emotion/styled"
import { Content, Trigger } from "@radix-ui/react-tooltip"

export const STrigger = styled(Trigger)`
  all: unset;

  height: fit-content;
`

export const SContent = styled(Content)`
  z-index: ${({ theme }) => theme.zIndices.tooltip};

  max-width: calc(100vw - 12px * 2);
  max-width: 280px;

  font-size: 12px;
  line-height: 16px;

  padding: 12px 16px;

  background: ${({ theme }) => theme.details.tooltips};
  box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
  border-radius: 8px;
`
