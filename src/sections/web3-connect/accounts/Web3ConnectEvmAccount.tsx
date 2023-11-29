import { useTokenBalance } from "api/balances"
import { useAccountCurrency } from "api/payments"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Web3ConnectAccountSelect } from "sections/web3-connect/accounts/Web3ConnectAccountSelect"
import { SEvmAccountItem } from "sections/web3-connect/accounts/Web3ConnectEvmAccount.styled"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { NATIVE_EVM_ASSET_DECIMALS, NATIVE_EVM_ASSET_SYMBOL } from "utils/evm"
import { requestAccounts } from "utils/metamask"

type Props = Account

export const Web3ConnectEvmAccount: FC<Props> = (account) => {
  const { t } = useTranslation()
  const { setAccount, toggle } = useWeb3ConnectStore()

  const { data: currencyId } = useAccountCurrency(account.address)

  const { data, isSuccess } = useTokenBalance(currencyId, account.address)

  return (
    <>
      <SEvmAccountItem>
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
        <div sx={{ flex: "row", gap: 12, mt: 12 }}>
          <Button
            variant="outline"
            fullWidth
            onClick={() => requestAccounts(window.ethereum)}
          >
            {t("walletConnect.accountSelect.change")}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setAccount(account)
              toggle()
            }}
          >
            {t("walletConnect.accountSelect.title")}
          </Button>
        </div>
      </SEvmAccountItem>
    </>
  )
}
