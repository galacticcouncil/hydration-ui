import { Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { VaultComposition } from "@/modules/liquidity/components/VaultDetails/VaultComposition"
import { VaultExplainer } from "@/modules/liquidity/components/VaultDetails/VaultExplainer"
import { VaultHeader } from "@/modules/liquidity/components/VaultDetails/VaultHeader"
import { VaultPositions } from "@/modules/liquidity/components/VaultDetails/VaultPositions"
import { VaultStats } from "@/modules/liquidity/components/VaultDetails/VaultStats"
import { useVaults } from "@/modules/liquidity/Vaults.utils"

type Props = {
  /** pool address, which is what the row links to */
  readonly address: string
}

export const VaultDetails: FC<Props> = ({ address }) => {
  const { data, isLoading, isDisconnected, isPositionError } = useVaults()

  const vault = data.find(
    (entry) => entry.id.toLowerCase() === address.toLowerCase(),
  )

  if (isLoading || !vault) return null

  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <VaultHeader vault={vault} />
      <VaultPositions
        vault={vault}
        isDisconnected={isDisconnected}
        isPositionError={isPositionError}
      />

      <VaultStats vault={vault} />

      <Flex direction={["column", "column", "row"]} align="stretch" gap="xl">
        <VaultComposition vault={vault} />
        <VaultExplainer vault={vault} />
      </Flex>
    </Flex>
  )
}
