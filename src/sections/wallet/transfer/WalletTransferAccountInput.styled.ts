import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.label<{ error?: boolean; disabled?: boolean }>`
  padding: 18px;

  transition: ${theme.transitions.default};

  background: rgba(${theme.rgbColors.alpha0}, 0.06);

  border-radius: 2px;
  border-bottom: 1px solid
    ${(p) => (p.error ? theme.colors.error : theme.colors.darkBlue400)};

  :focus,
  :focus-visible,
  :focus-within,
  :hover {
    cursor: text;

    ${({ disabled, error }) => {
      if (!disabled)
        return css`
          outline: none;

          background: rgba(${theme.rgbColors.primaryA15}, 0.12);

          border-bottom: 1px solid
            ${error ? theme.colors.error : theme.colors.brightBlue600};
        `
    }}
  }
`

export const SIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 5px;

  border-radius: 9999px;

  background: ${theme.colors.darkBlue400};
`
