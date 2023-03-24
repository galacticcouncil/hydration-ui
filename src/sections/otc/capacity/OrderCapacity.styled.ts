import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ modal: boolean }>`
  font-family: "ChakraPetch";
  background: rgba(10, 12, 22, 0.69);

  position: relative;
  text-align: center;
  margin: ${(p) => (p.modal ? "0 0 20px" : "0 -20px")};

  @media (${theme.viewport.gte.sm}) {
    background: inherit;
  }
`

export const SBarContainer = styled.div<{ modal: boolean }>`
  position: relative;

  width: 100%;
  height: ${(p) => (p.modal ? "11px" : "7px")};

  border-radius: 2px;
  background-color: rgba(84, 99, 128, 0.35);
`

export const SBar = styled.div<{ filled: string; width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: calc(100% - ${(p) => p.filled}%);

  border-radius: 2px;
  background: linear-gradient(
    270deg,
    ${theme.colors.pink600} 0%,
    ${theme.colors.brightBlue600} 100%
  );
  background-size: ${(p) => p.width + 30}px;
`
