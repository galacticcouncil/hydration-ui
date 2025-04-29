import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Switch, SwitchThumb } from "@radix-ui/react-switch"
import { SwitchSize } from "components/Switch/Switch"
import { theme } from "theme"
const getRootSize = (size: SwitchSize) => {
  switch (size) {
    case "small":
      return css`
        width: 30px;
        height: 18px;
      `
    case "medium":
      return css`
        width: 46px;
        height: 26px;
      `
    case "large":
      return css`
        width: 70px;
        height: 38px;
      `
  }
}
const getThumbSize = (size: SwitchSize) => {
  switch (size) {
    case "small":
      return "12px"
    case "medium":
      return "20px"
    case "large":
      return "32px"
  }
}

export const SSwitch = styled(Switch, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "withLabel",
})<{
  size?: SwitchSize
  withLabel?: boolean
}>`
  --switch-thumb-size: ${(p) => getThumbSize(p.size || "medium")};

  position: relative;

  border-radius: ${theme.borderRadius.default + 1}px;
  border: 1px solid ${theme.colors.basic700};

  background: rgba(${theme.rgbColors.black}, 0.25);

  cursor: pointer;

  transition: ${theme.transitions.slow};

  ${(p) => getRootSize(p.size || "medium")}

  ${(p) => {
    if (p.disabled) {
      return css`
        pointer-events: none;
        border-color: rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
      `
    }

    if (p.checked) {
      return css`
        background: rgba(218, 255, 238, 0.06);
        border: 1px solid ${theme.colors.brightBlue600};
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
              border-color: ${theme.colors.brightBlue300};
            `
          : css`
              background: ${theme.colors.basic400};
            `}
    }
  }

  ${(p) => p.withLabel && css({ marginLeft: 10 })}
`

export const SThumb = styled(SwitchThumb)<{
  checked: boolean
  disabled?: boolean
}>`
  position: absolute;
  top: 2px;
  left: 2px;

  border-radius: ${theme.borderRadius.default - 1}px;
  border: 1px solid transparent;

  background: ${theme.colors.basic500};

  width: var(--switch-thumb-size);
  height: var(--switch-thumb-size);

  transition: transform 0.2s;

  ${(p) =>
    p.checked &&
    css`
      transform: translateX(calc(var(--switch-thumb-size)));
      background: ${theme.colors.brightBlue700};
    `};

  ${(p) =>
    p.disabled &&
    css`
      background: ${theme.colors.basic750};
    `}
`
