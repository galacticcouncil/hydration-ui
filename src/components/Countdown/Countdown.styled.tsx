import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
`

export const SNumContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;

  & > p {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(${theme.rgbColors.brightBlue300}, 0.5);
    text-align: center;
    text-transform: uppercase;
    font-size: 10px;
    margin-top: 4px;
  }
`

export const SNum = styled.div`
  display: flex;
  flex-shrink: 0;

  color: ${theme.colors.darkBlue700};
  font-size: 30px;
  font-weight: 500;

  width: 40px;
  height: 54px;
  padding: 10px 12px;
  border-radius: 5px;

  background: ${theme.colors.brightBlue300};

  &::after {
    content: "";
    position: absolute;
    inset: 50% 0px;
    height: 2px;
    background-color: rgb(35, 35, 35);
    opacity: 0.1;
  }
`

export const SCountdownDivider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 4px;

  &::before,
  &::after {
    content: "";
    background: ${theme.colors.brightBlue300};
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
`
