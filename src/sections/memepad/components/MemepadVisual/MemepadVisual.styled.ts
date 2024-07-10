import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: absolute;

  right: 20px;
  top: 0;

  pointer-events: none;

  perspective: 300px;

  @media ${theme.viewport.gte.sm} {
    position: relative;

    margin-top: -200px;
    margin-left: 80px;
  }

  @media ${theme.viewport.gte.md} {
    width: 100%;
    height: auto;

    max-width: 350px;
    aspect-ratio: 350 / 500;
  }

  & > div {
    position: absolute;
  }

  & > div:nth-of-type(3) {
    top: 0;
    left: 0;
  }

  & > div:nth-of-type(2) {
    top: 220px;
    right: 0;
  }

  & > div:nth-of-type(1) {
    top: 360px;
    left: 50px;
  }
`
