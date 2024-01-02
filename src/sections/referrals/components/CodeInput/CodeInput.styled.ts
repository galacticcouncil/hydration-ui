import styled from "@emotion/styled"
import { theme } from "theme"
import { ErrorMessage } from "components/Label/Label.styled"

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
  &:disabled {
    cursor: not-allowed;

    opacity: 0.7;

    border: 1px solid ${theme.colors.darkBlue300};

    color: ${theme.colors.darkBlue300};
  }
`

export const SInputWrapper = styled.div`
  position: relative;
  width: 100%;

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
    position: absolute;
    top: 27px;
    right: 12px;
    transform: translateY(-50%);
    border: 0;
    :hover {
      border: 0;
    }
  }
`
export const SErrorMessage = styled(ErrorMessage)`
  @media ${theme.viewport.gte.sm} {
    position: absolute;
    top: 100%;
    left: 0;
  }
`
