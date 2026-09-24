import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Flex } from "../Flex"

export const SIcon = styled(Flex)(
  ({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    & > * {
      will-change: color;
      transition: ${theme.transitions.colors};
      width: 100%;
      height: 100%;
    }
  `,
)
