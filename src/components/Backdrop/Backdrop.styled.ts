import styled, { css } from "styled-components"
import { theme } from "theme"

export const SBackdrop = styled.div<{ variant?: "default" | "error" }>`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndices.backdrop};

  ${({ variant }) => {
    if (variant === "error") {
      return css`
        background: radial-gradient(
            70.22% 56.77% at 51.87% 101.05%,
            rgba(255, 82, 92, 0.24) 0%,
            rgba(255, 79, 90, 0) 100%
          ),
          rgba(7, 8, 14, 0.7);
      `
    }

    return css`
      background: radial-gradient(
          70.22% 56.77% at 51.87% 101.05%,
          rgba(79, 255, 176, 0.24) 0%,
          rgba(79, 255, 176, 0) 100%
        ),
        rgba(7, 8, 14, 0.7);
    `
  }}

  backdrop-filter: blur(7px);
`
