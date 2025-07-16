import { css } from "@emotion/react"

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
