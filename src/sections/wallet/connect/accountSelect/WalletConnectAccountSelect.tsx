import { FC } from "react"
import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { Box } from "components/Box/Box"
import { web3Accounts } from "@polkadot/extension-dapp"
import { useQuery } from "@tanstack/react-query"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"
import { useStore } from "state/store"

type Props = { provider: ProviderType; onSelect: () => void }

export const WalletConnectAccountSelect: FC<Props> = ({
  provider,
  onSelect,
}) => {
  const { t } = useTranslation("translation")
  const accounts = useQuery(["web3Accounts", provider], () => {
    return web3Accounts({ extensions: [provider] })
  })
  const { setAccount } = useStore()

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnect.accountSelect.description")}
      </Text>

      <Box
        flex
        column
        gap={10}
        mt={10}
        css={css`
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 450px;
        `}
      >
        {accounts.data?.map((account) => {
          const accountName = account.meta.name ?? account.address
          return (
            <WalletConnectAccountSelectItem
              key={account.address}
              name={accountName}
              address={account.address}
              setAccount={() => {
                setAccount({
                  name: accountName,
                  address: account.address,
                })
                onSelect()
              }}
            />
          )
        })}
      </Box>
    </>
  )
}
