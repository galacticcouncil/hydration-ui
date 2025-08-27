import { css } from "@emotion/react"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { styled } from "@/utils"

export const SPagination = styled(Flex)(
  ({ theme }) => css`
    position: sticky;
    left: 0;
    gap: 6px;
    justify-content: center;
    padding: 10px;
    border-top: 1px solid ${theme.details.separators};
  `,
)

export const SCollapsible = styled(Box)(
  () => css`
    interpolate-size: allow-keywords;

    @starting-style {
      height: 0px;
    }

    height: max-content;
    transition: height 0.3s ease;
  `,
)
