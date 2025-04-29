import { AccountTile, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"

const accounts = [
  {
    address: "5E12345678901234567890123456789012345678901234567890123456789012",
    name: "Account 1",
    symbol: "DOT",
    value: "100",
  },
  {
    address: "5E12345678901234567890123456789012345678901234567890123456789012",
    name: "Account 2",
    symbol: "DOT",
    value: "100",
  },
]

type Props = {
  readonly wallet: string
  readonly onSelect: (address: string) => void
}

export const AccountsList: FC<Props> = ({ wallet: _, onSelect }) => {
  return (
    <Flex direction="column" gap={10}>
      {accounts.map((account) => (
        <AccountTile
          sx={{ cursor: "pointer" }}
          key={account.address}
          name={account.name}
          symbol={account.symbol}
          address={account.address}
          value={account.value}
          onClick={() => onSelect(account.address)}
        />
      ))}
    </Flex>
  )
}
