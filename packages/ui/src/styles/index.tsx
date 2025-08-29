import { css, Global, Theme, useTheme } from "@emotion/react"

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

  a {
    color: unset;
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
    all: unset;
    font: inherit;
    box-sizing: border-box;
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

const scrollbar = (theme: Theme) => css`
  .windows ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    background: ${theme.controls.dim.base};
  }

  .windows ::-webkit-scrollbar-thumb {
    background: ${theme.controls.solid.activeHover};
    border-radius: 4px;
  }

  .windows ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
  }

  .windows ::-webkit-scrollbar-corner {
    background: transparent;
  }

  .firefox {
    scrollbar-width: thin;
  }
`

const globalStyles = (theme: Theme) => css`
  ${normalize}
  ${scrollbar(theme)}
  body {
    font-family: ${theme.fontFamilies1.secondary};
    font-size: 14px;
    font-weight: 400;

    background-color: ${theme.surfaces.themeBasePalette.background};
    color: ${theme.text.high};
  }

  ::selection {
    background-color: ${theme.text.tint.secondary};
    color: ${theme.buttons.primary.medium.onButton};
  }
`

export const GlobalStyles = () => {
  const theme = useTheme()
  return <Global styles={globalStyles(theme)} />
}
