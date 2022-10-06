import { FC } from "react"
import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Box } from "components/Box/Box"
import { useQuery } from "@tanstack/react-query"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"
import { Account } from "state/store"
import { getWalletBySource } from "@talismn/connect-wallets"

type Props = {
  provider: string
  onSelect: (account: Account) => void
  currentAddress: string | undefined
}

export const WalletConnectAccountSelect: FC<Props> = ({
  provider,
  onSelect,
  currentAddress,
}) => {
  const { t } = useTranslation("translation")

  const accounts = useQuery(["web3Accounts", provider], async () => {
    const wallet = getWalletBySource(provider)
    return await wallet?.getAccounts()
  })

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
        pb={10}
        css={css`
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 300px;

          &::-webkit-scrollbar-track {
            margin-bottom: 10px;
          }
        `}
      >
        {accounts.data
          // As Talisman allows Ethereum accounts to be added as well, filter these accounts out
          // as I believe these are not supported on Basilisk / HydraDX
          // @ts-expect-error
          ?.filter((i) => i.type !== "ethereum" && i.type !== "ecdsa")
          ?.map((account) => {
            const accountName = account.name ?? account.address
            return (
              <WalletConnectAccountSelectItem
                isActive={currentAddress === account.address}
                provider={provider}
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
