import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { FC } from "react"
import { theme } from "theme"
import { css, SerializedStyles } from "@emotion/react"

export enum StrategyTileVariant {
  One = "One",
  Two = "Two",
  Hollar = "Hollar",
  Prime = "Prime",
}

const desktopBackgroundVariantStyles: Record<
  StrategyTileVariant,
  SerializedStyles
> = {
  [StrategyTileVariant.One]: css`
    background: linear-gradient(
        180deg,
        rgba(248, 11, 107, 0.6) -0.47%,
        rgba(79, 31, 71, 0) 27.64%
      ),
      ${theme.colors.darkBlue700};

    @media ${theme.viewport.gte.md} {
      background: radial-gradient(
          50.55% 157.06% at 4.5% 150.85%,
          #f80b6b 5.78%,
          rgba(79, 31, 71, 0) 89.15%
        ),
        ${theme.colors.darkBlue700};
    }
  `,
  [StrategyTileVariant.Two]: css`
    background: linear-gradient(
        180deg,
        rgba(82, 82, 82, 1) -0.47%,
        rgba(79, 31, 71, 0) 27.64%
      ),
      ${theme.colors.darkBlue700};

    @media ${theme.viewport.gte.md} {
      background: radial-gradient(
          50.55% 157.06% at 4.5% 150.85%,
          #525252 5.78%,
          rgba(32, 32, 32, 0) 89.15%
        ),
        ${theme.colors.darkBlue700};
    }
  `,
  [StrategyTileVariant.Hollar]: css`
    background: linear-gradient(
        180deg,
        rgba(179, 207, 146, 0.5) -0.47%,
        rgba(84, 101, 63, 0) 46.94%
      ),
      ${theme.colors.darkBlue700};

    @media ${theme.viewport.gte.md} {
      background: radial-gradient(
          50.55% 157.06% at 4.5% 150.85%,
          #b3cf92 5.78%,
          rgba(32, 32, 32, 0) 89.15%
        ),
        ${theme.colors.darkBlue700};
    }
  `,
  [StrategyTileVariant.Prime]: css`
    background: linear-gradient(
        180deg,
        #8f67fd -0.47%,
        rgba(79, 31, 71, 0) 27.64%
      ),
      ${theme.colors.darkBlue700};

    @media ${theme.viewport.gte.md} {
      background: radial-gradient(
          50.55% 157.06% at 4.5% 150.85%,
          #8f67fd 5.78%,
          rgba(32, 32, 32, 0) 89.15%
        ),
        ${theme.colors.darkBlue700};
    }
  `,
}

export const SStrategyTile = styled.div<{
  readonly variant: StrategyTileVariant
}>`
  --strategy-tile-padding-block: 40px;

  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 20px;

  padding-top: 12px;
  padding-bottom: 18px;
  padding-inline: 12px;

  border-radius: 8px;
  border: 1px solid ${theme.colors.darkBlue400};

  z-index: 0;

  & > svg:nth-of-type(1) {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -10;
  }

  & > svg:nth-of-type(2) {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: -10;
  }

  ${({ variant }) => desktopBackgroundVariantStyles[variant]}

  @media ${theme.viewport.gte.sm} {
    padding-left: 20px;
    padding-right: 20px;
  }

  @media ${theme.viewport.gte.md} {
    padding-block: var(--strategy-tile-padding-block);

    padding-left: 30px;
    padding-right: 40px;

    display: grid;
    grid-template-columns: 3fr auto 2fr;
    column-gap: 40px;
  }
`

const SStrategyTileSeparator = styled(Separator)`
  @media ${theme.viewport.gte.md} {
    margin-block: calc(-1 * var(--strategy-tile-padding-block));
  }
`

export const StrategyTileSeparator: FC = () => {
  return (
    <>
      <SStrategyTileSeparator
        orientation="vertical"
        color="white"
        sx={{ display: ["none", "none", "initial"], opacity: 0.06 }}
      />
      <SStrategyTileSeparator
        orientation="horizontal"
        color="white"
        sx={{ display: ["initial", "initial", "none"], opacity: 0.06 }}
      />
    </>
  )
}
