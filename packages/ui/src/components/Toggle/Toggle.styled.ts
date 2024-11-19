import isPropValid from "@emotion/is-prop-valid"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Switch, SwitchProps, SwitchThumb } from "@radix-ui/react-switch"

type ToggleSize = "medium" | "large"

export type ToggleProps = SwitchProps & {
  size?: ToggleSize
  onCheckedChange: (v: boolean) => void
}

const getRootSize = (size: ToggleSize) => {
  switch (size) {
    case "medium":
      return css`
        width: 36px;
        height: 18px;
      `
    case "large":
      return css`
        width: 52px;
        height: 24px;
      `
  }
}
const getThumbSize = (size: ToggleSize) => {
  switch (size) {
    case "medium":
      return "12px"
    case "large":
      return "18px"
  }
}

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`

export const SToggle = styled(Switch, {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== "withLabel",
})<{
  size: ToggleSize
  withLabel?: boolean
}>(({ theme, size, disabled, checked }) => [
  css`
    --switch-thumb-size: ${getThumbSize(size)};

    position: relative;
    display: block;

    border-radius: ${theme.Containers["Corner radius"]["buttons-primary"]}px;
    border: 1px solid ${theme.Colors["dark-blue"].alpha[100]};

    background: ${theme.Controls.Dim.Rest.Default};

    cursor: pointer;

    transition: all 0.15s ease-in-out;

    ${getRootSize(size)}

    ${checked
      ? css`
          border-color: ${theme.Controls.Outline.Active.Default};
          background: ${theme.Controls.Dim.Active.Default};
          :not(:disabled):hover {
            border-color: ${theme.Controls.Outline.Active.Hover};

            > * {
              background: ${theme.Controls.Fill.Active.Hover};
            }
          }
        `
      : css`
          :not(:disabled):hover {
            border-color: ${theme.Controls.Outline.Rest.Hover};
            > * {
              background: ${theme.Controls.Fill.Rest.Hover};
            }
          }
        `}
  `,
  disabled && disabledStyles,
])

export const SThumb = styled(SwitchThumb)<Partial<ToggleProps>>(
  ({ theme, checked = false, disabled }) => [
    css`
      position: absolute;
      top: 3px;
      left: 3px;

      border-radius: ${theme.Containers["Corner radius"]["buttons-primary"]}px;
      border: 1px solid transparent;

      background: ${theme.Controls.Fill.Rest.Default};

      width: var(--switch-thumb-size);
      height: var(--switch-thumb-size);

      transition: all 0.15s ease-in-out;

      ${checked &&
      css`
        transform: translateX(calc(var(--switch-thumb-size) * ${1.5}));
        background: ${theme.Controls.Fill.Active.Default};
      `};
    `,
    disabled && disabledStyles,
  ],
)
