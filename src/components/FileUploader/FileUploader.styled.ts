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

    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    border: 1px dashed
      ${({ error }) => (error ? theme.colors.red400 : theme.colors.darkBlue400)};
    border-radius: ${theme.borderRadius.default}px;

    &:hover {
      border-color: rgba(${theme.rgbColors.brightBlue600}, 0.5);
    }

    &.drag-over {
      border-color: rgba(${theme.rgbColors.brightBlue600}, 0.75);
      background-color: rgba(${theme.rgbColors.primaryA15}, 0.12);
    }
  }
`

export const SUploadButton = styled.div`
  position: absolute;
  inset: 0;

  padding: 10px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  user-select: none;
  cursor: pointer;

  text-wrap: balance;

  @media ${theme.viewport.gte.sm} {
    padding: 20px;
  }
`

export const SUploadPreview = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  & > div {
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

export const SClearButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 24px;
  height: 24px;
  padding: 4px;

  color: ${theme.colors.basic400};
  background-color: ${theme.colors.basic800};

  border: none;
  border-radius: ${theme.borderRadius.default}px;

  cursor: pointer;

  :hover,
  :focus {
    background-color: ${theme.colors.basic700};
  }
`
