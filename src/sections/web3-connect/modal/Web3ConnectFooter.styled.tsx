import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-top: auto;

  @media ${theme.viewport.gte.sm} {
    margin-top: 24px;
  }
`

export const SLogoutButton = styled(Button)`
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.brightBlue600};

  padding: 8px 12px;

  text-transform: none;
  font-family: "GeistSemiBold";
  font-size: 14px;

  &:hover {
    background-color: rgba(${theme.rgbColors.white}, 0.08);
    border-color: rgba(${theme.rgbColors.white}, 0.08);
  }
`

export const SSwitchButton = styled(Button)`
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;

  color: ${theme.colors.brightBlue600};

  padding: 8px 12px;

  text-transform: none;
  font-family: "GeistSemiBold";
  font-size: 14px;

  &:hover {
    background-color: rgba(${theme.rgbColors.white}, 0.08);
    border-color: rgba(${theme.rgbColors.white}, 0.08);
  }
`

export const SSwitchText = styled(Text)`
  color: ${theme.colors.brightBlue600};
  display: flex;
  align-items: center;
  justify-content: center;
`
