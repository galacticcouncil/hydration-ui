import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  margin: -20px;
  padding: 20px 15px;
  background: rgba(10, 12, 22, 0.69);

  position: relative;
  text-align: center;

  @media (${theme.viewport.gte.sm}) {
    background: inherit;
  }
`

export const SBarContainer = styled.div`
  position: relative;

  width: 100%;
  height: 7px;

  margin-top: 3px;

  border-radius: 2px;
  background-color: ${theme.colors.darkBlue401};
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
  background-size: ${(p) => p.width}px;
`
