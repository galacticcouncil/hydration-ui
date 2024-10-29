import { Theme } from "@emotion/react"
import { css, Global, useTheme } from "@emotion/react"

const normalize = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  * {
    margin: 0;
  }
  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  img,
  picture,
  video,
  canvas,
  svg {
    display: block;
    max-width: 100%;
  }
  input,
  button,
  textarea,
  select {
    font: inherit;
  }
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    overflow-wrap: break-word;
  }
  p {
    text-wrap: pretty;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    text-wrap: balance;
  }

  #root {
    isolation: isolate;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`

export const globalStyles = (theme: Theme) => css`
  ${normalize}

  body {
    font-family: "Arial", sans-serif;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
  }

  a {
    color: ${theme.colors.primary};
  }
`

export const GlobalStyles = () => {
  const theme = useTheme()
  return <Global styles={globalStyles(theme)} />
}
