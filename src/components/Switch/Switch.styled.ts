import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Switch, SwitchThumb } from "@radix-ui/react-switch"
import { theme } from "theme"

export const SSwitch = styled(Switch, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "withLabel",
})<{
  size?: "small" | "regular"
  withLabel?: boolean
}>`
  --switch-thumb-size: ${(p) => (p.size === "small" ? "20px" : "34px")};

  position: relative;

  border-radius: 45px;
  border: 1px solid ${theme.colors.basic700};

  background: rgba(${theme.rgbColors.black}, 0.25);

  cursor: pointer;

  transition: ${theme.transitions.slow};

  ${(p) =>
    p.size === "small"
      ? css`
          width: 46px;
          height: 24px;
        `
      : css`
          width: 70px;
          height: 38px;
        `}

  ${(p) => {
    if (p.disabled) {
      return css`
        pointer-events: none;
        border-color: ${theme.colors.primaryA15Blue};
      `
    }

    if (p.checked) {
      return css`
        background: rgba(218, 255, 238, 0.06);
        border: 1px solid ${theme.colors.brightBlue400};
        :hover {
          border-color: ${theme.colors.brightBlue300};
        }
      `
    }
  }}
  


  :hover {
    > * {
      ${(p) =>
        p.checked
          ? css`
              top: 1px;
              right: 1px;
              width: var(--switch-thumb-size);
              height: var(--switch-thumb-size);
            `
          : css`
              top: 0px;
              left: 0px;
              width: calc(var(--switch-thumb-size) + 2px);
              height: calc(var(--switch-thumb-size) + 2px);
            `}
      border: ${(p) => (p.size === "small" ? "1.3px" : "2px")} solid ${theme
        .colors.brightBlue300};
    }
  }

  ${(p) => p.withLabel && css({ marginLeft: 10 })}
`

export const SThumb = styled(SwitchThumb)<{
  checked: boolean
  disabled?: boolean
  size?: "small" | "regular"
}>`
  position: absolute;
  top: 1px;
  left: 1px;

  border-width: ${(p) => (p.size === "small" ? "1px" : "2px")};
  border-radius: 50%;

  background: ${theme.colors.basic400};

  width: var(--switch-thumb-size);
  height: var(--switch-thumb-size);

  ${(p) =>
    p.checked &&
    css`
      width: calc(var(--switch-thumb-size) - 2px);
      height: calc(var(--switch-thumb-size) - 2px);
      left: initial;
      top: 2px;
      right: 2px;
      background: ${theme.colors.brightBlue500};
    `};

  ${(p) =>
    p.disabled &&
    css`
      background: ${theme.colors.basic750};
    `}
`
