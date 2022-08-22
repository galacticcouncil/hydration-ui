import styled, { css } from "styled-components"
import { theme } from "theme"

export const InputWrapper = styled.div<{
  unit: string | undefined
  dollars: string
}>`
  position: relative;
  ${(p) =>
    p.unit &&
    css`
      &::before {
        content: ${`"${p.unit}"`};
        position: absolute;
        font-size: 18px;
        line-height: 24px;
        top: 8px;
        right: 18px;
        width: auto;
        color: ${theme.colors.white};
        font-weight: 700;
      }
    `};
  ${(p) =>
    p.dollars &&
    css`
      &::after {
        content: ${`"≈  ${p.dollars}"`};
        position: absolute;
        font-size: 10px;
        line-height: 14px;
        bottom: 8px;
        right: 18px;
        width: auto;
        color: ${theme.colors.neutralGray400};
        font-weight: 600;
      }
    `};
`

export const StyledInput = styled.input<{ error?: string }>`
  width: 100%;

  background: ${theme.colors.backgroundGray800};
  border-radius: 9px;
  border: 1px solid
    ${(p) => (p.error ? theme.colors.error : theme.colors.backgroundGray600)};

  color: ${theme.colors.white};
  font-size: 18px;
  line-height: 24px;
  padding: 7px 55px 23px 14px;
  text-align: right;
  font-weight: 700;

  ::placeholder {
    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  :focus,
  :hover {
    background: ${theme.colors.backgroundGray700};
  }
`
