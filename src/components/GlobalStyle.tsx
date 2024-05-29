import ChakraPetch from "assets/fonts/ChakraPetch/ChakraPetch.ttf"
import ChakraPetchBold from "assets/fonts/ChakraPetch/ChakraPetchBold.ttf"
import ChakraPetchSemiBold from "assets/fonts/ChakraPetch/ChakraPetchSemiBold.ttf"
import FontOver from "assets/fonts/FontOver/FontOver.ttf"
import SatoshiVariable from "assets/fonts/SatoshiVariable/SatoshiVariable.ttf"
import Geist from "assets/fonts/Geist/Geist-Regular.ttf"
import GeistMono from "assets/fonts/GeistMono/GeistMono-Regular.otf"
import GeistBold from "assets/fonts/Geist/Geist-Bold.ttf"
import GeistMedium from "assets/fonts/Geist/Geist-Medium.ttf"

import { theme } from "theme"

export const normalize = `
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }
  body {
    margin: 0;
  }
  main {
    display: block;
  }
  h1 {
    font-size: 2em;
    margin: 0.67em 0;
  }
  hr {
    box-sizing: content-box;
    height: 0;
    overflow: visible;
  }
  pre {
    font-family: monospace, monospace;
    font-size: 1em;
  }
  a {
    background-color: transparent;
  }
  abbr[title] {
    border-bottom: none;
    text-decoration: underline;
    text-decoration: underline dotted;
  }
  b,
  strong {
    font-weight: bolder;
  }
  code,
  kbd,
  samp {
    font-family: monospace, monospace;
    font-size: 1em;
  }
  small {
    font-size: 80%;
  }
  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  sub {
    bottom: -0.25em;
  }
  sup {
    top: -0.5em;
  }
  img {
    border-style: none;
  }
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }
  button,
  input {
    overflow: visible;
  }
  button,
  select {
    text-transform: none;
  }
  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }
  button::-moz-focus-inner,
  [type="button"]::-moz-focus-inner,
  [type="reset"]::-moz-focus-inner,
  [type="submit"]::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }
  button:-moz-focusring,
  [type="button"]:-moz-focusring,
  [type="reset"]:-moz-focusring,
  [type="submit"]:-moz-focusring {
    outline: 1px dotted ButtonText;
  }
  fieldset {
    padding: 0.35em 0.75em 0.625em;
  }
  legend {
    box-sizing: border-box;
    color: inherit;
    display: table;
    max-width: 100%;
    padding: 0;
    white-space: normal;
  }
  progress {
    vertical-align: baseline;
  }
  textarea {
    overflow: auto;
  }
  [type="checkbox"],
  [type="radio"] {
    box-sizing: border-box;
    padding: 0;
  }
  [type="number"]::-webkit-inner-spin-button,
  [type="number"]::-webkit-outer-spin-button {
    height: auto;
  }
  [type="search"] {
    -webkit-appearance: textfield;
    outline-offset: -2px;
  }
  [type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit;
  }
  details {
    display: block;
  }
  summary {
    display: list-item;
  }
  template {
    display: none;
  }
  [hidden] {
    display: none;
  }
`

export const GlobalStyle = `
  @font-face {
    font-family: 'ChakraPetch';
    src: local("ChakraPetch"),
    url(${ChakraPetch}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'ChakraPetchBold';
    src: local("ChakraPetchBold"),
    url(${ChakraPetchBold}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'ChakraPetchSemiBold';
    src: local("ChakraPetchSemiBold"),
    url(${ChakraPetchSemiBold}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'FontOver';
    src: local("FontOver"),
    url(${FontOver}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'SatoshiVariable';
    src: local("SatoshiVariable"),
    url(${SatoshiVariable}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'Geist';
    src: local("Geist"),
    url(${Geist}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'GeistMono';
    src: local("GeistMono"),
    url(${GeistMono}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'GeistMedium';
    src: local("GeistMedium"),
    url(${GeistMedium}) format("truetype");
    font-display: auto;
  };

  @font-face {
    font-family: 'GeistBold';
    src: local("GeistBold"),
    url(${GeistBold}) format("truetype");
    font-display: auto;
  };



  ${normalize}
  
  html { 
    font-size: 62.5%; 
  }

  body {
    font-size: 1.6rem;
    margin: 0;
    font-family: 'Geist', sans-serif;
    background: ${theme.colors.bg};
  }

  html, body, #root {
    height: 100%;
    width:100%;
  }

  * {
  box-sizing: border-box;
  :focus-visible {
    outline: 1px solid ${theme.colors.brightBlue300};
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
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar:horizontal{
    width: 0px;
    height: 0px;
  }

  &::-webkit-scrollbar-thumb:vertical {
    background: ${theme.colors.basic600}; 
    border-radius: 4px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.darkBlue401}; 
    border-radius: 3px;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
`
