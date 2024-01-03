import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { ComponentPropsWithoutRef, FC } from "react"
import { useTranslation } from "react-i18next"
import { Web3ConnectAccount } from "sections/web3-connect/accounts/Web3ConnectAccount"
import { SAccountItem } from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { requestAccounts } from "utils/metamask"

export const Web3ConnectEvmAccount: FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const { t } = useTranslation()
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()

  const isActive = currentAccount?.address === account.address

  return (
    <>
      <SAccountItem
        isActive={isActive}
        onClick={() => {
          setAccount(account)
          toggle()
        }}
      >
        <div
          sx={{
            flex: "row",
            align: "center",
            justify: "space-between",
            mb: 12,
          }}
        >
          <Text font="ChakraPetchBold">{account.name}</Text>
          <div sx={{ flex: "row", align: "end", gap: 2, height: 20 }}>
            <Text color="basic200" fw={400}>
              <DisplayValue value={balance} />
            </Text>
          </div>
        </div>
        <Web3ConnectAccountSelect
          address={account.displayAddress ?? ""}
          theme={account.provider}
          name=""
        />
      </SAccountItem>
      <Button
        variant="outline"
        fullWidth
        size="small"
        onClick={() => requestAccounts(window.ethereum)}
      >
        {t("walletConnect.accountSelect.change")}
      </Button>
    </>
  )
}
