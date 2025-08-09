import { AnyChain } from "@galacticcouncil/xcm-core"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { ExternalLink } from "components/Link/ExternalLink"
import {
  getChainId,
  getExplorerAccountLink,
} from "sections/xcm/wormhole/WormholePage.utils"
import { shortenAccountAddress } from "utils/formatting"

export type TransferChainColumnProps = {
  chain: AnyChain
  address: string
}

export const TransferChainColumn: React.FC<TransferChainColumnProps> = ({
  chain,
  address,
}) => {
  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <Icon
        size={24}
        icon={<ChainLogo ecosystem={chain.ecosystem} id={getChainId(chain)} />}
      />
      <ExternalLink href={`${getExplorerAccountLink(chain, address)}`}>
        {shortenAccountAddress(address)}
      </ExternalLink>
    </div>
  )
}
