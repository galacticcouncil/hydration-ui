import styled from "@emotion/styled"
import { theme } from "theme"

export const SAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding-bottom: var(--wallet-footer-height);

  ::-webkit-scrollbar {
    width: 0px;
  }

  @media ${theme.viewport.gte.sm} {
    ::-webkit-scrollbar {
      width: 6px;
    }
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 76px;
    background: rgba(41, 41, 45, 0.5);
  }
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
