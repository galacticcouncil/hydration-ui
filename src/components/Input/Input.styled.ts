import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SWrapper = styled.div<{
  unit: string | undefined
}>`
  position: relative;

  ${(p) =>
    p.unit &&
    css`
      &::after {
        content: ${`"${p.unit}"`};

        position: absolute;
        top: 50%;
        right: 18px;
        transform: translateY(-50%);

        font-size: 14px;
        font-weight: 700;

        width: auto;

        color: ${theme.colors.white};
      }
    `};
`

export const SInput = styled.input<{ error?: string; unit?: string }>`
  width: 100%;

  box-sizing: border-box;

  border: none;
  border-bottom: 1px solid
    ${({ error }) => (error ? theme.colors.error : theme.colors.basic400)};

  background: rgba(218, 255, 238, 0.06);
  color: ${theme.colors.white};

  font-size: 14px;

  padding: 20px 18px;

  ::placeholder {
    color: rgba(${theme.colors.white}, 0.4);
  }

  :focus,
  :focus-visible,
  :hover {
    outline: none;

    border-bottom: 1px solid
      ${({ error }) =>
        error ? theme.colors.error : theme.colors.brightBlue300};
  }

  ${(p) =>
    p.unit &&
    css`
      padding-right: 50px;
    `}
`
