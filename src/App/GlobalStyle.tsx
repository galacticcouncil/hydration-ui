import { createGlobalStyle } from "styled-components/macro";
import { normalize } from "styled-normalize";
import Satoshi700 from "assets/fonts/Satoshi700.otf";
import Satoshi400 from "assets/fonts/Satoshi400.otf";
import Satoshi500 from "assets/fonts/Satoshi500.otf";
import { theme } from "theme";

export const GlobalStyle = createGlobalStyle`
 
  @font-face {
    font-family: 'Satoshi';
    src: local("Satoshi400"),
    url(${Satoshi400}) format("truetype");
    font-display: swap;
    font-weight: 400;
  }


  @font-face {
    font-family: 'Satoshi';
    src: local("Satoshi500"),
    url(${Satoshi500}) format("truetype");
    font-display: swap;
    font-weight: 500;
  }

  @font-face {
    font-family: 'Satoshi';
    src: local("Satoshi700"),
    url(${Satoshi700}) format("truetype");
    font-display: swap;
    font-weight: 700;
  }
 
  ${normalize};
  
  html { 
    font-size: 62.5%; 
  }

  body {
    font-size: 16px;
    font-size: 1.6rem;
    margin: 0;
    font-family: 'Satoshi500', sans-serif;
    background: ${theme.colors.backgroundGray1000};
  }

  html, body, #root {
    height: 100%;
    width:100%;
  }

  * {
  box-sizing: border-box;
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
`;
