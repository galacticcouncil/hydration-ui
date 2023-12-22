import { useTokenBalance } from "api/balances"
import { useAccountCurrency } from "api/payments"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { SAccountItem } from "sections/web3-connect/accounts/Web3ConnectAccount.styled"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { NATIVE_EVM_ASSET_DECIMALS, NATIVE_EVM_ASSET_SYMBOL } from "utils/evm"
import { requestAccounts } from "utils/metamask"

export const Web3ConnectEvmAccount: FC<Account> = (account) => {
  const { t } = useTranslation()
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()

  const { data: currencyId } = useAccountCurrency(account.address)

  const { data, isSuccess } = useTokenBalance(currencyId, account.address)

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
            {isSuccess ? (
              <>
                <Text color="basic200" fw={400}>
                  {t("value.token", {
                    value: data?.balance,
                    fixedPointScale: NATIVE_EVM_ASSET_DECIMALS,
                    type: "token",
                  })}
                </Text>
                <Text color="graySoft" tTransform="uppercase">
                  {NATIVE_EVM_ASSET_SYMBOL}
                </Text>
              </>
            ) : (
              <Skeleton width={70} height={20} />
            )}
          </div>
        </div>
        <Web3ConnectAccountSelect
          address={account.evmAddress ?? ""}
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
