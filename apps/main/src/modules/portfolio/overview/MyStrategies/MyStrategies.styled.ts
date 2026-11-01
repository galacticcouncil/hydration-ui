import { keyframes } from "@emotion/react"
import { Button } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

// Register the angle so the gradient rotates smoothly where supported.
try {
  CSS.registerProperty({
    name: "--juice-angle",
    syntax: "<angle>",
    inherits: false,
    initialValue: "0deg",
  })
} catch {
  // Already registered, or CSS Houdini is unavailable.
}

const spin = keyframes`
  to {
    --juice-angle: 360deg;
  }
`

export const SJuiceButton = styled(Button)(({ theme }) => {
  const yellow = theme.accents.alertAlt.primary
  const orange = theme.accents.alert.primary
  const lightYellow = `color-mix(in srgb, ${yellow} 60%, ${theme.text.high})`

  return css`
    isolation: isolate;

    && {
      color: ${yellow};
      background: color-mix(in srgb, ${yellow} 10%, transparent);
      box-shadow: none;
      font-weight: 500;
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
    }

    &::before {
      padding: 1px;
      background: conic-gradient(
        from var(--juice-angle),
        ${orange},
        ${lightYellow},
        ${orange}
      );
      animation: ${spin} 3s linear infinite;
      mask:
        linear-gradient(#000 0 0) content-box exclude,
        linear-gradient(#000 0 0);
    }

    &&:hover:not(:disabled):not([aria-disabled="true"]) {
      color: ${yellow};
      background: color-mix(in srgb, ${yellow} 28%, transparent);
    }

    &:hover:not(:disabled):not([aria-disabled="true"])::before {
      animation-duration: 1.2s;
    }

    @media (prefers-reduced-motion: reduce) {
      &::before {
        animation: none;
      }
    }
  `
})
