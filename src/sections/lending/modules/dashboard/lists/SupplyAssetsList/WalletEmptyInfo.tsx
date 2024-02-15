import { ChainId } from "@aave/contract-helpers"

import { Theme } from "@mui/material"
import { SxProps } from "@mui/system"
import { Warning } from "sections/lending/components/primitives/Warning"
import { NetworkConfig } from "sections/lending/ui-config/networksConfig"

import { Link } from "sections/lending/components/primitives/Link"

type WalletEmptyInfoProps = Pick<NetworkConfig, "bridge" | "name"> & {
  chainId: number
  icon?: boolean
  sx?: SxProps<Theme>
}

export function WalletEmptyInfo({
  bridge,
  name,
  chainId,
  icon,
  sx,
}: WalletEmptyInfoProps) {
  const network = [ChainId.avalanche].includes(chainId)
    ? "Ethereum & Bitcoin"
    : "Ethereum"

  return (
    <Warning variant="info" icon={icon} sx={sx}>
      {bridge ? (
        <span>
          Your {name} wallet is empty. Purchase or transfer assets or use{" "}
          {<Link href={bridge.url}>{bridge.name}</Link>} to transfer your{" "}
          {network} assets.
        </span>
      ) : (
        <span>Your {name} wallet is empty. Purchase or transfer assets.</span>
      )}
    </Warning>
  )
}
