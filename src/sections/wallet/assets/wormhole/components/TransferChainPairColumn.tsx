import { AnyChain } from "@galacticcouncil/xcm-core"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { getChainId } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"

export type TransferChainPairColumnProps = {
  fromChain: AnyChain
  toChain: AnyChain
}

export const TransferChainPairColumn: React.FC<
  TransferChainPairColumnProps
> = ({ fromChain, toChain }) => {
  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <InfoTooltip text={fromChain.name}>
        <Icon
          size={24}
          icon={
            <ChainLogo
              ecosystem={fromChain.ecosystem}
              id={getChainId(fromChain)}
            />
          }
        />
      </InfoTooltip>
      <Icon size={14} icon={<ArrowRightIcon />} />
      <InfoTooltip text={toChain.name}>
        <Icon
          size={24}
          icon={
            <ChainLogo ecosystem={toChain.ecosystem} id={getChainId(toChain)} />
          }
        />
      </InfoTooltip>
    </div>
  )
}
