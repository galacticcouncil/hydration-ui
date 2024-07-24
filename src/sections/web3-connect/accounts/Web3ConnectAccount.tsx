import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { getAddressVariants } from "utils/formatting"
import { SAccountItem } from "./Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "./Web3ConnectAccountSelect"

import BN from "bignumber.js"

type Props = Account & {
  isProxy?: boolean
  isActive?: boolean
  balance?: BN
  onClick?: (account: Account) => void
}

export const Web3ConnectAccount: FC<Props> = ({
  isProxy = false,
  isActive = false,
  onClick,
  balance,
  ...account
}) => {
  const { t } = useTranslation()
  const { address, name, displayAddress, provider, genesisHash } = account

  const { hydraAddress } = getAddressVariants(address)

  const addr = displayAddress || hydraAddress

  return (
    <SAccountItem
      isActive={isActive}
      isProxy={!!isProxy}
      onClick={() => onClick?.(account)}
    >
      {isProxy && (
        <>
          <div sx={{ py: 4 }}>
            <Trans t={t} i18nKey="walletConnect.accountSelect.proxyAccount">
              <Text color="pink500" fs={12} css={{ display: "inline-block" }} />
              <Text color="pink500" fs={12} css={{ display: "inline-block" }} />
            </Trans>
          </div>
          <Separator sx={{ mb: 4 }} />
        </>
      )}
      <Web3ConnectAccountSelect
        name={name}
        address={addr}
        genesisHash={genesisHash}
        provider={provider}
        isProxy={isProxy}
        isActive={isActive}
        balance={balance}
      />
    </SAccountItem>
  )
}
