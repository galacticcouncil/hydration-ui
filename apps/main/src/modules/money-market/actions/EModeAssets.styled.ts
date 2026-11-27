import styled from "@emotion/styled"

export const SEModeAssets = styled.span`
  display: inline-flex;
  align-items: center;

  > :not(:first-of-type) {
    margin-left: -${({ theme }) => theme.space.s};
    transition: margin-left 0.2s ${({ theme }) => theme.easings.outCubic};
  }

  &:hover > :not(:first-of-type) {
    margin-left: ${({ theme }) => theme.space.xs};
  }

  @media (prefers-reduced-motion: reduce) {
    > :not(:first-of-type) {
      transition: none;
    }
  }
`
