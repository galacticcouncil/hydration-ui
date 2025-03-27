import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;

  font-size: 12px;
  line-height: 1;

  border: 1px solid rgba(${theme.rgbColors.basic300}, 0.2);
  border-radius: ${theme.borderRadius.default}px;
  background-color: rgba(${theme.rgbColors.basic300}, 0.1);

  cursor: pointer;

  &:hover {
    background-color: rgba(${theme.rgbColors.basic300}, 0.2);
    border-color: rgba(${theme.rgbColors.basic300}, 0.2);
  }
`
