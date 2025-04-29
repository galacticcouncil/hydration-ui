import styled from "@emotion/styled"
import { theme } from "theme"

export const SCardContainer = styled.div`
  display: flex;
  gap: 10px;

  background: rgba(${theme.rgbColors.brightBlue300}, 0.2);

  padding: 12px 14px;

  border-radius: 2px;
`
export const SLink = styled.a`
  display: inline-block;

  font-size: 12px;
  line-height: 16px;

  color: ${theme.colors.brightBlue300};

  text-decoration: underline;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`
