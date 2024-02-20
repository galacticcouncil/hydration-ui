import { ChainId } from "@aave/contract-helpers"

import { Warning } from "sections/lending/components/primitives/Warning"
import { NetworkConfig } from "sections/lending/ui-config/networksConfig"

import { Link } from "sections/lending/components/primitives/Link"

type WalletEmptyInfoProps = Pick<NetworkConfig, "bridge" | "name"> & {
  chainId: number
  className?: string
}

export function WalletEmptyInfo({
  bridge,
  name,
  chainId,
  className,
}: WalletEmptyInfoProps) {
  const network = [ChainId.avalanche].includes(chainId)
    ? "Ethereum & Bitcoin"
    : "Ethereum"

  return (
    <Warning variant="info" className={className}>
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
