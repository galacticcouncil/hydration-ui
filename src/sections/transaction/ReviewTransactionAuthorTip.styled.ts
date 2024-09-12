import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: column;
`

export const SInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  position: relative;

  > p {
    position: absolute;

    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    font-size: 13px;
  }
`

export const SInput = styled.input`
  all: unset;

  padding: 4px 8px;

  box-sizing: border-box;

  text-align: right;

  font-size: 13px;
  line-height: 1.4;
  color: ${theme.colors.white};

  border: 1px solid ${theme.colors.darkBlue400};
  border-radius: ${theme.borderRadius.default}px;

  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  ::placeholder {
    color: rgba(114, 131, 165, 0.6);
  }
`
