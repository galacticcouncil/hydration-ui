import { css } from "@emotion/react"

import { UI_SCALE_VAR } from "@/utils"

export const getUiScaleCss = (width: number, scale: number) => css`
  @media (min-width: ${width}px) {
    :root {
      ${UI_SCALE_VAR}: ${scale};
    }
  }
`

export const uiScale = [
  getUiScaleCss(0, 1),
  getUiScaleCss(480, 1.1),
  // getUiScaleCss(1440, 1.1),
  // getUiScaleCss(1680, 1.1),
  getUiScaleCss(1920, 1.2),
  getUiScaleCss(2560, 1.5),
  getUiScaleCss(3840, 3),
]
