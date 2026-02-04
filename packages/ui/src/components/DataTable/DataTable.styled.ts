import { css } from "@emotion/react"

import { Box } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { styled } from "@/utils"

export const SPagination = styled(Flex)(
  ({ theme }) => css`
    position: sticky;
    left: 0;
    justify-content: center;
    padding: ${theme.space.base};
    border-top: 1px solid ${theme.details.separators};
  `,
)

export const SCollapsible = styled(Box)(
  () => css`
    padding: var(--table-column-padding-x);
  `,
)
