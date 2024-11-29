import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content, Trigger } from "@radix-ui/react-tooltip"

import { Icon } from "../Icon"

export const STrigger = styled(Trigger)`
  all: unset;

  height: fit-content;
`

export const SContent = styled(Content)`
  z-index: 99999;

  max-width: calc(100vw - 12px * 2);
  max-width: 280px;

  font-size: 12px;
  line-height: 16px;

  padding: 12px 16px;

  background: ${({ theme }) => theme.Details.tooltips};
  box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
  border-radius: 8px;
`

export const SInfoIcon = styled(Icon)(
  ({ theme }) => css`
    color: ${theme.Icons.onContainer};
    cursor: pointer;

    [data-state*="open"] > & {
      color: ${theme.Icons.onSurfaceHover};
    }
  `,
)
