import { AnyChain } from "@galacticcouncil/xcm-core"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { getChainId } from "sections/xcm/wormhole/WormholePage.utils"

export type TransferChainPairColumnProps = {
  fromChain: AnyChain
  toChain: AnyChain
}

export const TransferChainPairColumn: React.FC<
  TransferChainPairColumnProps
> = ({ fromChain, toChain }) => {
  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <Icon
        size={24}
        icon={
          <ChainLogo
            ecosystem={fromChain.ecosystem}
            id={getChainId(fromChain)}
          />
        }
      />
      <Icon size={14} icon={<ArrowRightIcon />} />
      <Icon
        size={24}
        icon={
          <ChainLogo ecosystem={toChain.ecosystem} id={getChainId(toChain)} />
        }
      />
    </div>
  )
}
