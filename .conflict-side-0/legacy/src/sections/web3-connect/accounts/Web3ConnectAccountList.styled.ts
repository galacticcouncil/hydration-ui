import styled from "@emotion/styled"
import { theme } from "theme"

export const SAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const SAccountsSearchContainer = styled.div`
  position: relative;

  & > svg {
    position: absolute;

    top: 50%;
    left: 12px;

    transform: translateY(-50%);

    color: rgba(${theme.rgbColors.white}, 0.4);
  }

  input[type="text"] {
    padding-left: 48px;
    background: rgba(158, 167, 186, 0.06);

    &::placeholder {
      color: rgba(${theme.rgbColors.white}, 0.4);
    }
  }
`

export const SAccountsScrollableContainer = styled.div`
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: 10px;

  max-height: calc(100vh - 260px);

  margin-right: calc((var(--modal-content-padding) / 2) * -1);
  padding-right: calc(var(--modal-content-padding) / 2);

  ::-webkit-scrollbar {
    width: 0px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(41, 41, 45, 0.5);
  }

  @media ${theme.viewport.gte.sm} {
    max-height: 300px;

    ::-webkit-scrollbar {
      width: 4px;
    }
  }
`
