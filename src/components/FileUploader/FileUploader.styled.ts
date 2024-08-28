import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div<{ error?: boolean }>`
  position: relative;

  & > div {
    display: flex;
    width: 100%;
    padding: 10px;

    width: 100%;
    height: 100%;
    min-height: 80px;

    border: 1px dashed
      ${({ error }) => (error ? theme.colors.red400 : theme.colors.basic600)};
    border-radius: ${theme.borderRadius.default}px;

    &.drag-over {
      border-color: ${theme.colors.brightBlue300};
      background-color: ${theme.colors.darkBlue401};
    }
  }
`

export const SUploadButton = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  user-select: none;
  cursor: pointer;
`

export const SUploadPreview = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`

export const SClearButton = styled.button`
  background-color: ${theme.colors.basic800};
  border: none;
  position: absolute;
  top: 4px;
  right: 4px;
  color: ${theme.colors.basic400};
  cursor: pointer;

  border-radius: ${theme.borderRadius.default}px;

  :hover,
  :focus {
    background-color: ${theme.colors.basic700};
  }
`
