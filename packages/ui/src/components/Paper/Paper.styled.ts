import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { createVariants } from "@/utils"

import { PaperProps } from "./Paper"

const variants = createVariants((theme) => ({
  bordered: css`
    border: 1px solid ${theme.details.borders};

    box-shadow:
      0px 3px 9px 0px rgba(0, 0, 0, 0.04),
      0px 14px 37px 0px rgba(0, 0, 0, 0.04);
  `,
  plain: css``,
}))

export const SPaper = styled(Box)<PaperProps>(
  ({ theme, variant = "bordered", hoverable = false }) => [
    variants(variant),
    hoverable &&
      css`
        transition: ${theme.transitions.transform};
        transition-timing-function: ${theme.easings.outExpo};
        transition-duration: 0.5s;
        &:hover {
          transform: translateY(-0.25rem);
        }
      `,
    css`
      position: relative;
      background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};
    `,
  ],
)
