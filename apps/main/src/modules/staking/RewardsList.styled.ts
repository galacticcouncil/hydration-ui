import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SRewardsListChartContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 20px;

    padding-inline: ${theme.containers.paddings.primary}px;
    padding-block: ${theme.containers.paddings.primary}px;
    background: ${theme.surfaces.containers.mid.primary};

    border: solid 1px ${theme.buttons.secondary.low.onOutline};
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    ${mq("sm")} {
      flex-direction: row;
      align-items: center;
      gap: 0;
    }
  `,
)

export const SRemainderContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: ${theme.containers.paddings.primary}px;
    background: ${theme.surfaces.containers.dim.dimOnBg};

    border: 1px solid ${theme.buttons.secondary.low.onOutline};
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  `,
)
