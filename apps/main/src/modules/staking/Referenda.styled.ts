import { css, styled } from "@galacticcouncil/ui/utils"

type Props = {
  readonly voted?: boolean
}

export const SReferenda = styled.div<Props>(
  ({ theme, voted }) => css`
    display: flex;
    flex-direction: column;
    gap: 11px;

    min-width: 350px;
    padding-inline: 16px;
    padding-block: 20px;
    border-radius: 16px;
    background: ${voted
      ? theme.surfaces.containers.high.primary
      : theme.surfaces.containers.low.primary};

    border: solid 1px
      ${voted ? theme.details.borders : theme.surfaces.containers.low.border};
  `,
)

export const SReferendaProgress = styled.div(
  ({ theme }) => css`
    display: flex;
    gap: 7px;

    padding-inline: ${theme.scales.paddings.base}px;
    padding-block: 7px;

    background: #4d525f1a;
    border: solid 1px #7c7f8a33;
    border-radius: 12px;
  `,
)
