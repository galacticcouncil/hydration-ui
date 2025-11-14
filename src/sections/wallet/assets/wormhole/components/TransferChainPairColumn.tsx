import { AnyChain, SolanaChain } from "@galacticcouncil/xcm-core"
import { useQuery } from "@tanstack/react-query"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { getAccount } from "@solana/spl-token"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import { getChainId } from "utils/xcm"
import { PublicKey } from "@solana/web3.js"
import Skeleton from "react-loading-skeleton"
import { QUERY_KEYS } from "utils/queryKeys"

export type TransferChainPairColumnProps = {
  fromChain: AnyChain
  toChain: AnyChain
  from: string
  to: string
}

export const TransferChainPairColumn: React.FC<
  TransferChainPairColumnProps
> = ({ fromChain, toChain, from, to }) => {
  const fromAddress = getChainSpecificAddress(from) || from

  const { data: toAddres, isSuccess } = useQuery({
    queryKey: QUERY_KEYS.wormholeTransferOwner(to),
    queryFn: async () => {
      if (!(toChain instanceof SolanaChain)) {
        return getChainSpecificAddress(to) || to
      }
      const pubkey = new PublicKey(to)

      const accountInfo = await getAccount(toChain.connection, pubkey)
      return accountInfo.owner.toString()
    },
  })

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
        {shortenAccountAddress(fromAddress)}
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
        {isSuccess ? (
          shortenAccountAddress(toAddres)
        ) : (
          <Skeleton width={120} height={16} />
        )}
      </span>
    </div>
  )
}
