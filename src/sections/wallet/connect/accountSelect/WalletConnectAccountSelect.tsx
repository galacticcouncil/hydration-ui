import { FC } from "react"
import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { Box } from "components/Box/Box"
import { web3Accounts } from "@polkadot/extension-dapp"
import { useQuery } from "@tanstack/react-query"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"
import { Account } from "state/store"

type Props = {
  provider: ProviderType
  onSelect: (account: Account) => void
  currentAddress: string | undefined
}

export const WalletConnectAccountSelect: FC<Props> = ({
  provider,
  onSelect,
  currentAddress,
}) => {
  const { t } = useTranslation("translation")
  const accounts = useQuery(["web3Accounts", provider], () => {
    return web3Accounts({ extensions: [provider] })
  })

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnect.accountSelect.description")}
      </Text>

      <Box
        flex
        column
        mt={10}
        gap={10}
        css={css`
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 450px;

          mask-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 1) 2%
          );

          padding: 20px 0;
        `}
      >
        {accounts.data
          // As Talisman allows Ethereum accounts to be added as well, filter these accounts out
          // as I believe these are not supported on Basilisk / HydraDX
          ?.filter((i) => i.type !== "ethereum" && i.type !== "ecdsa")
          ?.map((account) => {
            const accountName = account.meta.name ?? account.address
            return (
              <WalletConnectAccountSelectItem
                isActive={currentAddress === account.address}
                key={account.address}
                name={accountName}
                address={account.address}
                setAccount={() => {
                  onSelect({
                    name: accountName,
                    address: account.address,
                    provider,
                  })
                }}
              />
            )
          })}
      </Box>
    </>
  )
}
