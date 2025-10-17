import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SReferendaList = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.primary}px;

    ${mq("md")} {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    @media (min-width: 1164px) {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }
  `,
)

type SReferendaProps = {
  readonly voted?: boolean
}

export const SReferenda = styled.div<SReferendaProps>(
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

export const SReferendaProgress = styled.div<{
  readonly size: "small" | "large"
}>(
  ({ theme, size }) => css`
    display: grid;

    padding-inline: ${theme.scales.paddings.base}px;
    padding-block: ${size === "small" ? 4 : 7}px;

    background: #4d525f1a;
    border: solid 1px #7c7f8a33;
    border-radius: 12px;
  `,
)
