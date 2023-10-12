import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SBlock = styled.div<{ selected: boolean }>`
  cursor: pointer;
  border-radius: 4px;
  padding: 24px 22px 42px 24px;

  border: 1px solid rgba(51, 55, 80, 1);
  margin-top: 10px;

  ${({ selected }) =>
    selected &&
    css`
      border-color: ${theme.colors.darkBlue700};
      background: linear-gradient(
          0deg,
          rgba(19, 18, 47, 0.52),
          rgba(19, 18, 47, 0.52)
        ),
        radial-gradient(
          202.95% 202.95% at 30.22% 151.83%,
          #ff014d 0%,
          rgba(255, 32, 193, 0) 100%
        );
    `}
`
