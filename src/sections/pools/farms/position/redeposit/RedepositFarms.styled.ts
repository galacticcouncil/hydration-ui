import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  align-self: center;

  background: linear-gradient(
    90deg,
    rgba(63, 197, 255, 0.2) 1.67%,
    rgba(198, 209, 219, 0.09) 101.96%
  );

  border-radius: 4px;

  padding: 10px 12px;

  height: fit-content;
  width: 100%;

  @media (${theme.viewport.gte.sm}) {
    width: auto;
  }
`

export const SJoinButton = styled.button`
  cursor: pointer;

  border: none;
  border-radius: 4px;

  transition: ${theme.transitions.slow};

  background: ${theme.colors.brightBlue300};

  padding: 9px 0;

  width: 118px;
  &:disabled {
    cursor: not-allowed;
    box-shadow: unset;
    transform: none;

    color: ${theme.colors.darkBlue300};
    border: 1px solid ${theme.colors.darkBlue300};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);

    opacity: 0.7;

    &::after,
    &::before {
      all: unset;
    }
  }
  &:hover {
    opacity: 0.8;
  }
`
