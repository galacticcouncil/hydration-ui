import { createGlobalStyle } from "styled-components"
import { normalize } from "styled-normalize"
import SatoshiVariable from "assets/fonts/SatoshiVariable.ttf"

import { theme } from "theme"

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'SatoshiVariable';
    src: local("SatoshiVariable"),
    url(${SatoshiVariable}) format("truetype");
    font-display: auto;
    font-weight: 100 900;
  };
 
  ${normalize};
  
  html { 
    font-size: 62.5%; 
  }

  body {
    font-size: 16px;
    font-size: 1.6rem;
    margin: 0;
    font-family: 'SatoshiVariable', sans-serif;
    background: ${theme.colors.backgroundGray1000};
  }

  html, body, #root {
    height: 100%;
    width:100%;
  }

  * {
  box-sizing: border-box;
  :focus-visible {
    outline: 1px solid ${theme.colors.primary300};
  }
  }

  h1 {
    margin: 0;
  }
  
  h2 {
    margin: 0;
  }

  h3 {
    margin: 0;
  }
  
  h4 {
    margin: 0;
  }
  
  p {
    margin: 0;
  }

  ul {
    list-style-type: none;
  }

  a {
    text-decoration: none;
    color: unset;
  }

  &::-webkit-scrollbar {
    width: 18px;
    height: 18px;
  }

  &::-webkit-scrollbar-thumb:vertical {
    background: transparent url("/images/Scrollbar.svg") no-repeat;
    background-position: bottom;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`
