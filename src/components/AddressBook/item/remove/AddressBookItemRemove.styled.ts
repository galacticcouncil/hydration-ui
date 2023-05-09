import styled from "@emotion/styled"
import { fadeInKeyframes } from "components/Dropdown/Dropdown.styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-color: rgba(${theme.rgbColors.darkBlue700}, 0.9);
  color: ${theme.colors.white};

  animation: ${fadeInKeyframes} 0.15s ease-in-out;
`

export const SButtons = styled.div`
  display: grid;
  grid-template-columns: 3fr 4fr;
  grid-column-gap: 20px;

  width: 100%;
  max-width: 400px;
`
