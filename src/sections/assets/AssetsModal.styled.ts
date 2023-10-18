import styled from "@emotion/styled"
import { theme } from "theme"

export const SAssetsModalHeader = styled.div<{
  shadowed?: boolean
}>`
  display: flex;
  justify-content: space-between;
  background: ${({ shadowed }) =>
    shadowed
      ? `rgba(${theme.rgbColors.white}, .03)`
      : `rgba(${theme.rgbColors.alpha0}, 0.06)`};
  border-left: none;
  border-right: none;
  padding: 5px 12px;

  @media ${theme.viewport.gte.sm} {
    padding: 5px 20px;
  }
`

export const SAssetsModalSearchWrapper = styled.div`
  position: relative;

  & > svg {
    position: absolute;

    top: 50%;
    left: 10px;

    transform: translateY(-50%);
    color: ${theme.colors.basic600};
  }

  input[type="text"] {
    padding-left: 48px;
  }
`

export const SAssetsModalContentWrapper = styled.div`
  margin-left: calc(var(--modal-content-padding) * -1);
  margin-right: calc(var(--modal-content-padding) * -1);
`
