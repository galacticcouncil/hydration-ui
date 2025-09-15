import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { useAccountIdentity } from "api/stats"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { shortenAccountAddress } from "utils/formatting"
import { Maybe } from "utils/helpers"
import { getChainId } from "utils/xcm"

const AccountName = ({
  address,
  addressDisplay,
}: {
  address: string
  addressDisplay: string
}) => {
  const identity = useAccountIdentity(address)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const strLen = isDesktop ? 6 : 4

  if (identity.data?.identity) return <>{identity.data.identity}</>

  return <>{shortenAccountAddress(addressDisplay ?? address, strLen)}</>
}

type Props = {
  isCrossChain: boolean
  chain: Maybe<ReturnType<typeof chainsMap.get>>
  address: string
  addressDisplay: string
  color?: keyof typeof theme.colors
}

export const AccountColumn: FC<Props> = ({
  isCrossChain,
  chain,
  address,
  addressDisplay,
  color = "basic200",
}) => {
  return (
    <Text
      color={color}
      fs={14}
      sx={{ flex: "row", gap: 8, align: "center", justify: "center" }}
    >
      {chain && isCrossChain && (
        <span
          sx={{
            display: "block",
            width: 16,
            height: 16,
          }}
        >
          <ChainLogo id={getChainId(chain)} ecosystem={chain.ecosystem} />
        </span>
      )}
      {address && (
        <AccountName address={address} addressDisplay={addressDisplay} />
      )}
    </Text>
  )
}
