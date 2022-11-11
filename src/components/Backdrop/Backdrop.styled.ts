import { css, SerializedStyles } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"
import { BackdropVariant } from "./Backdrop"

export const SBackdrop = styled.div<{
  variant?: BackdropVariant
}>`
  width: 100%;
  height: 100vh;

  position: fixed;
  top: 0;
  left: 0;
  z-index: ${theme.zIndices.backdrop};

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ variant }) => variant && variantStyles[variant]}

  backdrop-filter: blur(7px);
`

const variantStyles: Record<BackdropVariant, SerializedStyles> = {
  default: css`
    background: rgba(0, 7, 50, 0.7);
  `,
  error: css`
    background: radial-gradient(
        70.22% 56.77% at 51.87% 101.05%,
        rgba(255, 82, 92, 0.24) 0%,
        rgba(255, 79, 90, 0) 100%
      ),
      rgba(1, 9, 83, 0.7);
  `,
  success: css`
    background: radial-gradient(
        70.22% 56.77% at 51.87% 101.05%,
        rgba(106, 255, 82, 0.24) 0%,
        rgba(79, 255, 149, 0) 100%
      ),
      rgba(1, 9, 83, 0.7);
  `,
}
