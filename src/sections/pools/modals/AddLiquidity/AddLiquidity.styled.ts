import styled from "@emotion/styled"
import { theme } from "theme"

export const SCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;

  background: rgba(${theme.rgbColors.brightBlue300}, 0.2);

  padding: 12px 14px;
  margin-bottom: 12px;

  border-radius: 2px;
`
export const SLink = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;

  width: fit-content;

  font-size: 12px;
  line-height: 16px;

  color: ${theme.colors.brightBlue300};

  border-bottom: 1px solid ${theme.colors.brightBlue300};

  cursor: pointer;

  margin-top: 8px;

  &:hover {
    opacity: 0.8;
  }
`
