import { Box, Flex, Separator } from "@galacticcouncil/ui/components"
import { containerSize, css, styled } from "@galacticcouncil/ui/utils"

import { SUnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition.styled"

const BREAKPOINT = "20rem"

export const SPendingPosition = styled(SUnstakingPosition)(
  ({ theme }) => css`
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};

    ${containerSize(
      BREAKPOINT,
      css`
        flex-wrap: nowrap;
        gap: 0;
      `,
    )}
  `,
)

export const SAmountSection = styled(Flex)(
  ({ theme }) => css`
    order: 0;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    gap: ${theme.space.s};

    ${containerSize(
      BREAKPOINT,
      css`
        flex: 0 1 auto;
      `,
    )}
  `,
)

export const SActionsGroup = styled(Flex)(
  ({ theme }) => css`
    display: contents;

    ${containerSize(
      BREAKPOINT,
      css`
        display: flex;
        order: 1;
        align-items: center;
        gap: ${theme.space.m};
        flex-shrink: 0;
      `,
    )}
  `,
)

export const SUnlockSection = styled(Box)`
  order: 3;
  flex-basis: 100%;
  width: 100%;

  ${containerSize(
    BREAKPOINT,
    css`
      order: unset;
      flex-basis: auto;
      width: auto;
    `,
  )}
`

export const SCancelSection = styled(Box)`
  order: 1;
  flex-shrink: 0;

  ${containerSize(
    BREAKPOINT,
    css`
      order: unset;
    `,
  )}
`

export const SMobileSeparator = styled(Separator)`
  order: 2;
  flex-basis: 100%;
  width: 100%;

  ${containerSize(
    BREAKPOINT,
    css`
      display: none;
    `,
  )}
`

export const SCountdownValueStats = styled(Box)(
  ({ theme }) => css`
    & > div {
      align-items: flex-end;
      margin-bottom: -${theme.space.s};
    }

    ${containerSize(
      BREAKPOINT,
      css`
        & > div {
          flex-direction: column;
          align-items: flex-end;
          margin-bottom: 0;
        }
      `,
    )}
  `,
)
