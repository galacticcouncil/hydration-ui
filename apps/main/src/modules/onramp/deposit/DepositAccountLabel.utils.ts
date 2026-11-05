import { shortenAccountAddress } from "@galacticcouncil/utils"
import type { Account } from "@galacticcouncil/web3-connect"

const normalize = (value: string) => value.replace(/[.\s…]/g, "").toLowerCase()

export const getDepositAccountLabel = (account: Account) => {
  const address = shortenAccountAddress(account.displayAddress)
  const name = account.name.trim()
  const isAddress = [
    account.address,
    account.rawAddress,
    account.displayAddress,
    address,
  ].some((value) => normalize(value) === normalize(name))
  return !name || isAddress ? address : `${name} · ${address}`
}
