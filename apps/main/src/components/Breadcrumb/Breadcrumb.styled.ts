import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Flex } from "@galacticcouncil/ui/components"

export const SContainer = styled(Flex)(
  ({ theme }) => css`
    width: 100%;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -8px;
      left: 0;
      width: var(--header-width);
      height: 1px;
      background-color: ${theme.details.separators};
      left: 50%;
      transform: translateX(-50%);
    }
  `,
)
