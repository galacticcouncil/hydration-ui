import { bigShift } from "@galacticcouncil/utils"

import {
  AccountOption,
  AccountOptionProps,
} from "@/components/account/AccountOption"
import { useSolanaNativeBalance } from "@/hooks/useSolanaNativeBalance"

export const AccountSolanaOption: React.FC<AccountOptionProps> = (props) => {
  const { data, isLoading } = useSolanaNativeBalance(props.rawAddress)

  return (
    <AccountOption
      {...props}
      balance={
        data ? bigShift(data.amount, -data.decimals).toNumber() : undefined
      }
      balanceSymbol={data?.symbol}
      isBalanceLoading={isLoading}
    />
  )
}
