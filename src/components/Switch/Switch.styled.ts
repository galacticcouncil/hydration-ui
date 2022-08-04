import { Switch, SwitchThumb } from "@radix-ui/react-switch";
import styled, { css } from "styled-components/macro";
import { theme } from "theme";

export const StyledThumb = styled(SwitchThumb)<{
  checked: boolean;
  disabled?: boolean;
  size?: "small" | "regular";
}>`
  position: absolute;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  border-color: ${theme.colors.darkGray};
  padding: 2px;
  background: ${theme.colors.neutralGray400};
  border-style: solid;

  ${(p) =>
    p.size === "small"
      ? css`
          width: 20px;
          height: 20px;
          border-width: 1px;
        `
      : css`
          width: 34px;
          height: 34px;
          border-width: 2px;
        `}

  ${(p) =>
    p.checked &&
    css`
      left: initial;
      right: 1px;
      background: ${theme.colors.primarySuccess500};
      border-color: ${theme.colors.darkGreen};
    `}

  ${(p) =>
    p.disabled &&
    css`
      background: ${theme.colors.backgroundGray800};
    `}
`;

export const StyledSwitch = styled(Switch)<{ size?: "small" | "regular" }>`
  position: relative;
  border-radius: 45px;
  border: 1px solid ${theme.colors.backgroundGray700};
  background: ${theme.colors.darkGray};
  cursor: pointer;

  ${(p) =>
    p.size === "small"
      ? css`
          width: 46px;
          height: 24px;
        `
      : css`
          width: 70px;
          height: 38px;
        `}

  ${(p) =>
    p.checked &&
    css`
      background: ${theme.colors.darkGreen};
      border: 1px solid ${theme.colors.primarySuccess300};
    `}
  ${(p) =>
    p.disabled &&
    css`
      pointer-events: none;
    `};

  :hover {
    > * {
      border-color: ${theme.colors.primarySuccess300};
    }
  }
`;
