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
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.l};

    min-width: 22rem;
    padding-inline: ${theme.space.l};
    padding-block: ${theme.space.l};
    border-radius: ${theme.radii.xl};
    background: ${theme.surfaces.containers.high.primary};

    border: solid 1px ${theme.details.borders};
  `,
)

export const SReferendaProgress = styled.div<{
  readonly size: "small" | "large"
}>(
  ({ theme, size }) => css`
    display: grid;

    padding-inline: ${theme.space.s};
    padding-block: ${size === "small" ? theme.space.xs : theme.space.s};

    background: ${theme.surfaces.containers.dim.dimOnBg};
    border: solid 1px ${theme.controls.dim.accent};
    border-radius: ${theme.radii.full};
  `,
)
