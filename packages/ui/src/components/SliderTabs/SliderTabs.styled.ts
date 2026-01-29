import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Flex } from "../Flex"

export const SSliderTabs = styled(Flex)(
  ({ theme }) => css`
    padding: ${theme.inputs.paddings.internal} 6px;

    align-items: center;
    gap: ${theme.inputs.paddings.internal};

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: 32px;
  `,
)
