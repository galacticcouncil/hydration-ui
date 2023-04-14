import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;

  margin-left: 20px;
`

export const SGroupContainer = styled.div`
  position: relative;

  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 11px;
  margin-left: -10px;
  padding-left: 10px;
  padding-top: 14px;
`

export const SLine = styled.div`
  position: absolute;
  left: -25px;

  width: 1px;
  height: 100%;

  background: ${theme.colors.pink600};
`

export const SLeaf = styled.div`
  position: absolute;
  bottom: 140px;
  left: -25px;

  border: solid ${theme.colors.basic800};
  border-width: 0 0 1px 1px;
  border-bottom-left-radius: 14px;

  height: calc(100% + 40px);
  width: 19px;
`
