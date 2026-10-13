import { WalletProviderType } from "@/config/providers"
import { BaseNearWallet } from "@/wallets/BaseNearWallet"

import logo from "./logo.svg"

export class LedgerNear extends BaseNearWallet {
  provider = WalletProviderType.LedgerNear
  accessor = "ledger"
  title = "Ledger"
  installUrl = "https://www.ledger.com"
  logo = logo

  // The device is reached over WebHID, which only Chromium browsers have
  get installed() {
    return "hid" in navigator
  }
}
