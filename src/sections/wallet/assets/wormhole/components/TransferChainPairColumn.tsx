import { H160, isEvmAccount } from "@galacticcouncil/sdk"
import { AnyChain } from "@galacticcouncil/xcm-core"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { getChainId } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { shortenAccountAddress } from "utils/formatting"

export type TransferChainPairColumnProps = {
  fromChain: AnyChain
  toChain: AnyChain
  from: string
  to: string
}

export const TransferChainPairColumn: React.FC<
  TransferChainPairColumnProps
> = ({ fromChain, toChain, from, to }) => {
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
      <span sx={{ display: ["none", "inline"] }}>
        {shortenAccountAddress(from)}
      </span>
      <Icon size={14} icon={<ArrowRightIcon />} />
      <InfoTooltip text={toChain.name}>
        <Icon
          size={24}
          icon={
            <ChainLogo ecosystem={toChain.ecosystem} id={getChainId(toChain)} />
          }
        />
      </InfoTooltip>
      <span sx={{ display: ["none", "inline"] }}>
        {shortenAccountAddress(isEvmAccount(to) ? H160.fromAccount(to) : to)}
      </span>
    </div>
  )
}
