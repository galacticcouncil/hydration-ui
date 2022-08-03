import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import styled, { css } from "styled-components";
import { theme } from "theme";

export const StyledThumb = styled(SwitchThumb)<{
  checked: boolean;
  disabled?: boolean;
}>`
  width: 34px;
  height: 34px;
  position: absolute;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  border: 2px solid ${theme.colors.darkGray};
  padding: 2px;
  background: ${theme.colors.neutralGray400};

  ${(p) =>
    p.checked &&
    css`
      left: initial;
      right: 1px;
      background: ${theme.colors.primarySuccess500};
      border: 2px solid ${theme.colors.darkGreen};
    `}

  :hover {
    border: 2px solid ${theme.colors.primarySuccess300};
  }

  ${(p) =>
    p.disabled &&
    css`
      background: ${theme.colors.backgroundGray800};
    `}
`;
export const StyledSwitch = styled(Switch)`
  width: 70px;
  height: 38px;
  position: relative;
  border-radius: 45px;
  border: 1px solid ${theme.colors.backgroundGray700};
  background: ${theme.colors.darkGray};
  cursor: pointer;

  ${(p) =>
    p.checked &&
    css`
      background: ${theme.colors.darkGreen};
      border: 1px solid ${theme.colors.darkGreen};
    `}
  ${(p) =>
    p.disabled &&
    css`
      pointer-events: none;
    `}
`;
