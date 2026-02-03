import { Box } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SWalletBox = styled(Box)(
  ({ theme }) => css`
    font-size: ${theme.fontSizes.p6};

    display: inline-flex;
    justify-content: center;
    align-items: center;

    border-radius: 50%;
    overflow: hidden;
    border: 2px solid ${theme.surfaces.containers.high.hover};
  `,
)

export const SContainer = styled.div`
  display: flex;
  align-items: center;

  > div:not(:first-of-type) {
    margin-left: -${({ theme }) => theme.space.base};
  }
`
