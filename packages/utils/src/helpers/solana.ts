import { SolanaAddr } from "@galacticcouncil/utils"
import { toHex } from "@polkadot-api/utils"
import { AccountId } from "polkadot-api"

const SOLANA_EXPLORER_URL = "https://explorer.solana.com"
type SolanaExplorerLinkPath = "tx"

export const solexplorer = {
  link: (path: SolanaExplorerLinkPath, data: string | number): string => {
    return `${SOLANA_EXPLORER_URL}/${path}/${data}`
  },
  tx: (txHash: string) => {
    return solexplorer.link("tx", txHash)
  },
}

export const safeConvertSolanaAddressToSS58 = (
  address: string,
  ss58prefix = 0,
) => {
  try {
    return AccountId(ss58prefix).dec(SolanaAddr.getPubKey(address))
  } catch {
    return ""
  }
}

export function safeConvertSS58ToSolanaAddress(ss58Addr: string) {
  try {
    return SolanaAddr.encodePubKey(toHex(AccountId().enc(ss58Addr)))
  } catch {
    return ""
  }
}
