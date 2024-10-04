import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;

  margin-left: 15px;
`

export const SGroupContainer = styled.div`
  position: relative;

  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-left: -6px;
  padding-left: 6px;
  padding-top: 6px;
`

export const SLine = styled.div`
  position: absolute;
  left: -20px;

  width: 1px;
  height: 100%;

  background: ${theme.colors.pink600};
`

export const SLeaf = styled.div`
  position: absolute;
  top: 0;
  left: -20px;

  border: solid ${theme.colors.basic800};
  border-width: 0 0 1px 1px;
  border-bottom-left-radius: 14px;

  height: 50%;
  width: 12px;

  &::after {
    content: "";
    position: absolute;

    left: 100%;
    bottom: 0;

    width: 4px;
    height: 4px;
    margin-bottom: -2px;
    border-radius: 50%;

    background: ${theme.colors.basic800};
  }
`
