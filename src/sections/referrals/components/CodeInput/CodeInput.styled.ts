import styled from "@emotion/styled"
import { theme } from "theme"

export const SInput = styled.input<{
  hasError?: boolean
}>`
  width: 100%;

  color: ${theme.colors.white};

  font-size: 14px;

  padding: 18px 14px;

  box-sizing: border-box;

  border-radius: ${theme.borderRadius.default}px;
  border: ${({ hasError }) =>
    hasError
      ? `1px solid ${theme.colors.red400}`
      : `1px solid rgba(${theme.rgbColors.brightBlue300}, 0.6)`};

  outline-color: ${({ hasError }) =>
    hasError ? theme.colors.red400 : theme.rgbColors.brightBlue300};

  background: rgba(158, 167, 186, 0.06);

  ::placeholder {
    color: ${theme.colors.brightBlue300};
  }

  &:focus {
    border: 1px solid rgba(${theme.rgbColors.brightBlue300}, 0.6);
    outline-color: ${theme.colors.brightBlue300};
  }

  &:disabled {
    cursor: not-allowed;

    opacity: 0.7;

    border: 1px solid ${theme.colors.darkBlue400};

    color: ${theme.colors.darkBlue300};
  }
`

export const SInputWrapper = styled.div`
  position: relative;
  width: 100%;

  display: flex;
  flex-direction: column;

  & > svg {
    position: absolute;
    top: 27px;
    left: 12px;
    transform: translateY(-50%);
    color: ${theme.colors.brightBlue300};
    pointer-events: none;
  }

  & > input {
    padding-left: 40px;
  }

  & > button {
    border: 0;
    padding: 5px 10px;

    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 4px;

    backdrop-filter: blur(6.5px);

    :hover {
      border: 0;
    }
  }

  @media ${theme.viewport.gte.xs} {
    & > button {
      padding: 2px 4px;
      margin-bottom: 0;

      top: 27px;
      right: 12px;
      bottom: auto;

      transform: translateY(-50%);
    }
  }
`
export const SAlertMessage = styled.p<{ variant?: "error" | "info" }>`
  font-size: 12px;
  line-height: 16px;
  margin-top: 2px;

  color: ${({ variant }) =>
    variant === "error" ? theme.colors.error : theme.colors.brightBlue300};

  @media ${theme.viewport.gte.sm} {
    position: absolute;
    top: 100%;
    left: 0;
  }
`
