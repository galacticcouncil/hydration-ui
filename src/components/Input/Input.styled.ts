import styled, { css } from "styled-components/macro"
import { theme } from "theme"

export const InputWrapper = styled.div<{
  unit: string | undefined
}>`
  position: relative;

  ${(p) =>
    p.unit &&
    css`
      &::after {
        content: ${`"${p.unit}"`};
        position: absolute;
        font-size: 14px;
        top: 50%;
        transform: translateY(-50%);
        right: 18px;
        width: auto;
        color: ${theme.colors.white};
        font-weight: 700;
      }
    `};
`

export const StyledInput = styled.input<{ error?: string; unit?: string }>`
  background: ${theme.colors.backgroundGray800};
  border-radius: 9px;
  border: 1px solid
    ${(p) => (p.error ? theme.colors.error : theme.colors.backgroundGray600)};

  color: ${theme.colors.white};
  font-size: 14px;
  padding: 20px 18px;

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  :focus,
  :hover {
    background: ${theme.colors.backgroundGray700};
  }

  ${(p) =>
    p.unit &&
    css`
      padding-right: 50px;
    `}
`
