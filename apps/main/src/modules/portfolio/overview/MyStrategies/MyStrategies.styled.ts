import { keyframes } from "@emotion/react"
import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

// An angle only animates as a registered property, and @property cannot sit
// inside a styled rule. Unregistered, the border is a static gradient.
try {
  CSS.registerProperty({
    name: "--juice-angle",
    syntax: "<angle>",
    inherits: false,
    initialValue: "0deg",
  })
} catch {
  // already registered, or no CSS Houdini
}

const spin = keyframes`
  to {
    --juice-angle: 360deg;
  }
`

export const SJuiceButton = styled(Button)(({ theme }) => {
  const yellow = theme.accents.alertAlt.primary
  const pink = theme.colors.coral[900]
  const gradient = `conic-gradient(from var(--juice-angle), ${yellow}, ${pink}, ${yellow})`

  return css`
    isolation: isolate;
    font-weight: 700;

    &&,
    &&:hover:not(:disabled):not([aria-disabled="true"]) {
      background: transparent;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      border-radius: inherit;
      background: ${gradient};
      animation: ${spin} 3s linear infinite;
      pointer-events: none;
    }

    /* spinning gradient border */
    &::before {
      inset: 0;
      padding: 1.5px;
      mask:
        linear-gradient(#000 0 0) content-box exclude,
        linear-gradient(#000 0 0);
    }

    /* soft glow behind it */
    &::after {
      inset: -6px;
      z-index: -1;
      filter: blur(14px);
      opacity: 0.28;
      transition: ${theme.transitions.opacity};
    }

    &:hover::before {
      animation-duration: 1.2s;
    }

    &:hover::after {
      opacity: 0.4;
    }

    @media (prefers-reduced-motion: reduce) {
      &::before,
      &::after {
        animation: none;
      }
    }
  `
})
