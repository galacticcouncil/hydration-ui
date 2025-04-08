import styled from "@emotion/styled"
import { Separator } from "components/Separator/Separator"
import { FC } from "react"
import { theme } from "theme"

export const SStrategyTile = styled.div`
  --strategy-tile-padding-block: 40px;

  position: relative;
  overflow: hidden;

  display: grid;
  grid-template-columns: 5fr auto 4fr;
  column-gap: 40px;

  padding-block: var(--strategy-tile-padding-block);
  padding-left: 30px;
  padding-right: 40px;

  border-radius: 8px;
  border: 1px solid ${theme.colors.darkBlue400};

  background: radial-gradient(
      50.55% 157.06% at 4.5% 150.85%,
      #f80b6b 5.78%,
      rgba(79, 31, 71, 0) 89.15%
    ),
    ${theme.colors.darkBlue700};

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

  @media ${theme.viewport.lt.sm} {
    display: flex;
    flex-direction: column;
    gap: 20px;

    padding-top: 12px;
    padding-bottom: 18px;
    padding-inline: 12px;

    background: linear-gradient(
        180deg,
        rgba(248, 11, 107, 0.6) -0.47%,
        rgba(79, 31, 71, 0) 27.64%
      ),
      ${theme.colors.darkBlue700};
  }
`

const SStrategyTileSeparator = styled(Separator)`
  @media ${theme.viewport.gte.sm} {
    margin-block: calc(-1 * var(--strategy-tile-padding-block));
  }
`

export const StrategyTileSeparator: FC = () => {
  return (
    <>
      <SStrategyTileSeparator
        orientation="vertical"
        color="white"
        sx={{ display: ["none", "initial"], opacity: 0.06 }}
      />
      <SStrategyTileSeparator
        orientation="horizontal"
        color="white"
        sx={{ display: ["initial", "none"], opacity: 0.06 }}
      />
    </>
  )
}
