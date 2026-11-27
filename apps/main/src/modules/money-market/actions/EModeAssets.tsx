import { Text, Tooltip } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetLogo } from "@/components/AssetLogo"
import { SEModeAssets } from "@/modules/money-market/actions/EModeAssets.styled"
import { ReserveDisplay } from "@/modules/money-market/reserves/reserveDisplay"

type Props = {
  readonly assets: ReadonlyArray<ReserveDisplay>
}

export const EModeAssets: FC<Props> = ({ assets }) => (
  <SEModeAssets>
    {assets.map(({ logoId, name, symbol }) => (
      <Tooltip
        key={logoId}
        text={
          <>
            <Text fs="p4" fw={600}>
              {symbol}
            </Text>
            <Text fs="p5">{name}</Text>
          </>
        }
        size="small"
        delayDuration={0}
        asChild
      >
        <span>
          <AssetLogo id={logoId} size="small" collapsed />
        </span>
      </Tooltip>
    ))}
  </SEModeAssets>
)
