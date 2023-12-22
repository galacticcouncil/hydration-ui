import { useTokenBalance } from "api/balances"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getAddressVariants } from "utils/formatting"
import { SAccountItem } from "./Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "./Web3ConnectAccountSelect"
import { getChainByPrefix } from "utils/helpers"

type Props = Account & {
  isProxy?: boolean
  isActive?: boolean
  onClick?: (account: Account) => void
}

export const Web3ConnectAccount: FC<Props> = ({
  isProxy = false,
  isActive = false,
  onClick,
  ...account
}) => {
  const { t } = useTranslation()
  const { address, name, provider, displayAddress, ss58Prefix } = account

  const { hydraAddress, polkadotAddress } = getAddressVariants(address)

  const {
    isLoaded,
    assets: { native },
  } = useRpcProvider()

  const { data } = useTokenBalance(native?.id, polkadotAddress)

  return (
    <SAccountItem
      isActive={isActive}
      isProxy={!!isProxy}
      onClick={() => onClick?.(account)}
    >
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text font="ChakraPetchBold">{name}</Text>
        {isLoaded ? (
          <div sx={{ flex: "row", align: "end", gap: 2 }}>
            <Text color="basic200" fw={400}>
              {t("value.token", {
                value: data?.balance,
                fixedPointScale: native?.decimals,
                type: "token",
              })}
            </Text>
            <Text color="graySoft" tTransform="uppercase">
              {native?.symbol}
            </Text>
          </div>
        ) : (
          <Skeleton width={70} height={20} />
        )}
      </div>

      {isProxy && (
        <>
          <Separator sx={{ my: 14 }} />
          <div>
            <Trans t={t} i18nKey="walletConnect.accountSelect.proxyAccount">
              <Text
                color="pink500"
                fs={14}
                font="ChakraPetchBold"
                css={{ display: "inline-block" }}
              />
              <Text color="pink500" fs={14} css={{ display: "inline-block" }} />
            </Trans>
          </div>
        </>
      )}
      <div sx={{ flex: "column", mt: 12, gap: 12 }}>
        <Web3ConnectAccountSelect
          name={
            Number.isFinite(ss58Prefix)
              ? getChainByPrefix(ss58Prefix)?.displayName ?? ""
              : ""
          }
          address={displayAddress || hydraAddress}
          theme={provider}
          isProxy={isProxy}
        />
      </div>
    </SAccountItem>
  )
}
