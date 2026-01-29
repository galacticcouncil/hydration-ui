import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SReferendaList = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.containers.paddings.primary};

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
    gap: ${theme.space.base};

    min-width: 22rem;
    padding-inline: ${theme.space.l};
    padding-block: ${theme.space.xl};
    border-radius: ${theme.radii.xl};
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

    padding-inline: ${theme.space.base};
    padding-block: ${size === "small" ? theme.space.s : theme.space.base};

    background: #4d525f1a;
    border: solid 1px #7c7f8a33;
    border-radius: 12px;
  `,
)
