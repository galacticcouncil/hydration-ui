import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as Tooltip from "@radix-ui/react-tooltip"
import { theme } from "theme"

export const STrigger = styled(Tooltip.Trigger)`
  all: unset;

  height: fit-content;
`

export const SContent = styled(Tooltip.Content)<{ type: "default" | "black" }>`
  z-index: 10;

  max-width: calc(100vw - 12px * 2);

  padding: 11px 16px;

  ${({ type }) =>
    type === "default"
      ? css`
          background: ${theme.colors.darkBlue400};
          border-radius: 4px;
        `
      : css`
          background: ${theme.colors.black};
          border-radius: 7px;
        `}
`
