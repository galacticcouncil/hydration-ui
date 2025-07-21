import styled from "@emotion/styled"
import { Link } from "@tanstack/react-location"
import { theme } from "theme"

import LinesSvg from "./assets/lines.svg"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  position: relative;
`

export const SInnerContainer = styled(Link)`
  display: flex;
  align-items: none;
  flex-direction: column;
  justify-content: space-around;
  gap: 6px;

  overflow: hidden;

  position: relative;

  border: 1px solid rgba(124, 175, 255, 0.4);
  border-radius: ${theme.borderRadius.medium}px;

  @media ${theme.viewport.gte.sm} {
    height: 89px;
  }

  &:before {
    content: "";
    position: absolute;
    inset: -1px;
    overflow: hidden;
    border-radius: ${theme.borderRadius.medium}px;
    transform: rotate(180deg);
    opacity: 0.5;
    background: linear-gradient(
      90deg,
      #b3cf92 0%,
      #c3e19f 25%,
      rgba(179, 207, 146, 0) 75%
    );

    @media ${theme.viewport.gte.sm} {
      transform: rotate(0);
      opacity: 1;
    }
  }

  &:after {
    content: "";
    position: absolute;
    inset: -1px;
    background: center left url(${LinesSvg}) no-repeat;
    background-size: 120% 100%;
    opacity: 0.3;
    transform: rotate(160deg) scale(1.5) translate(-20%, -20%);

    @media ${theme.viewport.gte.sm} {
      background-size: auto;
      opacity: 1;
      transform: none;
    }
  }
`

export const SContent = styled.div`
  position: relative;
  height: 100%;

  padding: 20px;

  display: flex;
  flex-direction: column;

  @media ${theme.viewport.gte.sm} {
    padding-left: 140px;
    padding-right: 34px;

    flex-direction: row;
    align-items: center;
  }
`

export const SValuesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  margin-top: 20px;

  @media ${theme.viewport.gte.sm} {
    grid-template-columns: 1fr 1fr auto;
    margin-left: auto;
    margin-top: 0;
  }

  @media ${theme.viewport.gte.md} {
    gap: 60px;
  }
`

export const SHollarImage = styled.img`
  position: absolute;

  top: -14px;
  right: -8px;

  @media ${theme.viewport.gte.sm} {
    left: 14px;

    right: auto;
  }
`
