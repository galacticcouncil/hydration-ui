import {
  AccountOption,
  AccountOptionProps,
} from "@/components/account/AccountOption"
import { useSuiNativeBalance } from "@/hooks/useSuiNativeBalance"

export const AccountSuiOption: React.FC<AccountOptionProps> = (props) => {
  const { data, isLoading } = useSuiNativeBalance(props.rawAddress)

  return (
    <AccountOption
      {...props}
      balance={data?.toBigDecimal().toNumber()}
      balanceSymbol={data?.symbol}
      isBalanceLoading={isLoading}
    />
  )
}
