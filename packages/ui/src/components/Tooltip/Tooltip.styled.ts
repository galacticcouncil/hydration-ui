import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content, Trigger } from "@radix-ui/react-tooltip"

export const STrigger = styled(Trigger)`
  all: unset;

  height: fit-content;
`

export const SContent = styled(Content)(
  ({ theme }) => css`
    z-index: ${theme.zIndices.tooltip};

    max-width: calc(100vw - ${theme.space.m} * 2);
    max-width: 17.5rem;

    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.m};

    padding: ${theme.space.m} ${theme.space.l};

    background: ${theme.details.tooltips};
    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
    border-radius: ${theme.radii.m};
  `,
)
