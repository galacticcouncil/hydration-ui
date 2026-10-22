import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-popover"

import { floatingScaleAnimation } from "@/styles/animations"

export const SContent = styled(Content)(
  ({ theme }) => css`
    z-index: ${theme.zIndices.popover};

    ${floatingScaleAnimation(theme)};
  `,
)
