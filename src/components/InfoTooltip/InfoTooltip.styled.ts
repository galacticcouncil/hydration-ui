import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as Tooltip from "@radix-ui/react-tooltip"
import { theme } from "theme"
import InfoIcon from "assets/icons/InfoIconBlue.svg?react"

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

  transition: all ${theme.transitions.default};

  border-radius: 9999px;

  & > path:nth-of-type(1) {
    fill: url(#paint0_linear_16038_17627);
  }

  & > path:nth-of-type(2) {
    fill: ${theme.colors.brightBlue300};
  }

  [data-state*="open"] > & {
    cursor: pointer;

    & > path:nth-of-type(1) {
      fill: #57b3eb;
      fill-opacity: 1;
    }

    & > path:nth-of-type(2) {
      fill: #00041d;
    }
  }
`
