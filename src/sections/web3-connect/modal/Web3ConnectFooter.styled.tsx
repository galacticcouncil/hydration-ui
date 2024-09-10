import styled from "@emotion/styled"
import { Button } from "components/Button/Button"
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

export const SProviderIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 6px;
  div {
    font-size: 11px;
    font-family: "GeistSemiBold";

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    margin-left: -6px;

    border-radius: 50%;
    overflow: hidden;
    border: 2px solid ${theme.colors.darkBlue401};

    @media ${theme.viewport.gte.sm} {
      width: 32px;
      height: 32px;
    }
  }
`
