import { STATS_TILES } from "./StastTiles.util"
import { SContainer } from "./StatsTiles.styled"
import { StatsTilesTile } from "./tile/StatsTilesTile"

export const StatsTiles = () => {
  return (
    <SContainer>
      {STATS_TILES.map((tile) => (
        <StatsTilesTile key={tile.id} {...tile} />
      ))}
    </SContainer>
  )
}
