import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SInput = styled.input<{ error?: string }>`
  all: unset;
  color: currentColor;

  transition: ${theme.transitions.default};

  ::placeholder {
    color: rgba(${theme.colors.primary100}, 0.4);
  }

  :focus-visible {
    outline: none;
  }
`

export const SInputWrapper = styled.span<{
  error?: string
  disabled?: boolean
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 100%;

  background: ${theme.colors.backgroundGray800};
  border-radius: 9px;
  border: 1px solid ${theme.colors.backgroundGray600};

  color: ${theme.colors.white};
  font-size: 14px;
  padding: 5px 18px;

  min-height: 54px;

  transition: ${theme.transitions.default};

  ::placeholder {
    color: rgba(${theme.colors.primary100}, 0.4);
  }

  :focus-within,
  :hover {
    background: ${theme.colors.backgroundGray700};
  }

  :focus-within {
    border-color: ${theme.colors.primary300};
  }

  ${({ disabled, error }) => {
    if (disabled) {
      return css`
        &,
        &:focus-within,
        &:hover {
          background: rgba(${theme.rgbColors.white}, 0.03);
          border-color: transparent;
          color: ${theme.colors.neutralGray300};
        }
      `
    }

    if (error) {
      return css`
        &,
        &:focus-within,
        &:hover {
          border-color: ${theme.colors.error};
        }
      `
    }

    return null
  }}
`

export const SErrorMessage = styled.p`
  color: ${theme.colors.error};
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;
  text-transform: capitalize;
`
