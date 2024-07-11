import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ variant: "a" | "b" }>`
  position: relative;

  pointer-events: none;

  perspective: 300px;

  @media ${theme.viewport.gte.md} {
    width: 100%;
    height: auto;

    max-width: 350px;
  }

  & > div {
    position: absolute;
  }

  & > div:nth-of-type(3) {
    top: 0;
    ${({ variant }) => (variant === "a" ? "left: 0" : "right: 0")};
  }

  & > div:nth-of-type(2) {
    top: 200px;
    ${({ variant }) => (variant === "a" ? "right: 0" : "left: 0")};
  }

  & > div:nth-of-type(1) {
    top: 360px;
    ${({ variant }) => (variant === "a" ? "left: 50px" : "right: 50px")};
  }
`
export const SContainerMobile = styled.div`
  position: relative;

  img {
    width: 100%;
    height: auto;
    max-width: 100%;
  }
`
