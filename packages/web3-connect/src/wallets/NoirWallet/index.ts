import { shortenAccountAddress, ZecAddr } from "@galacticcouncil/utils"
import {
  getNoirWallet,
  isNoirWalletInstalled,
  type ZcashAddress,
  type ZcashAPI,
  type ZcashConnectResult,
} from "@noir-wallet/sdk"
import { isObjectType } from "remeda"

import { WalletProviderType } from "@/config/providers"
import { SubscriptionFn, Wallet, WalletAccount } from "@/types/wallet"
import {
  BaseWalletError,
  NotInstalledError,
  UserRejectedError,
} from "@/utils/errors"

import logo from "./logo.png"

// Noir declines a request with EIP-1193's code
const USER_REJECTED_CODE = 4001

const isRejection = (err: unknown) =>
  isObjectType(err) && "code" in err && err.code === USER_REJECTED_CODE

const getErrorMessage = (err: unknown) =>
  isObjectType(err) && "message" in err && typeof err.message === "string"
    ? err.message
    : ""

/**
 * One account per approved Noir wallet, by its transparent address.
 *
 * - Swaps pay out to `t1`/`t3` only, so shielded addresses are left out
 * - A testnet build's addresses fail the same check
 */
const toWalletAccounts = (
  { accounts }: ZcashConnectResult,
  provider: WalletProviderType,
): WalletAccount[] =>
  accounts
    .filter(({ addresses }) => ZecAddr.isValid(addresses.transparent))
    .map(({ label, addresses }) => ({
      address: addresses.transparent,
      name: label || shortenAccountAddress(addresses.transparent),
      provider,
    }))

export class NoirWallet implements Wallet {
  provider = WalletProviderType.NoirWallet
  accessor = "noirwallet"
  title = "Noir Wallet"
  installUrl =
    "https://chromewebstore.google.com/detail/noir-wallet/mfoghjbpfanobmnoemoepenjjcmfpmdn"
  logo = logo

  // Noir only receives swap payouts so far, so it never signs
  signer = undefined

  _extension: ZcashAPI | undefined
  _enabled: boolean = false

  _accounts: WalletAccount[] = []

  get installed() {
    return isNoirWalletInstalled()
  }

  get enabled() {
    return this._enabled
  }

  get extension() {
    return this._extension
  }

  transformError = (err: unknown): Error => {
    if (err instanceof BaseWalletError) return err
    if (isRejection(err)) return new UserRejectedError(this)

    return new BaseWalletError(
      this,
      getErrorMessage(err) || `${this.title} could not be connected.`,
    )
  }

  /** Connects from the modal, asking for approval when the site has none. */
  enable = () => this.connect(true)

  /** Brings back an approved session on reload, without ever opening Noir. */
  restore = () => this.connect(false)

  private connect = async (approve: boolean) => {
    const zcash = getNoirWallet()?.zcash
    if (!zcash) throw new NotInstalledError(this)

    try {
      // An approved site reads its accounts silently; a locked or unapproved
      // wallet reads none, and only approving opens Noir
      let result = await zcash.getAccounts().catch(() => null)
      if (!result && approve) {
        result = await zcash.connect()
      }

      if (!result) throw new UserRejectedError(this)

      const accounts = toWalletAccounts(result, this.provider)
      if (!accounts.length) {
        throw new BaseWalletError(
          this,
          `${this.title} has no Zcash mainnet address.`,
        )
      }

      this._extension = zcash
      this._enabled = true
      this.setAccounts(accounts)
    } catch (err: unknown) {
      throw this.transformError(err)
    }
  }

  setAccounts = (accounts: WalletAccount[]) => {
    this._accounts = accounts
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return this._accounts
  }

  subscribeAccounts = (callback: SubscriptionFn) => {
    const zcash = this._extension
    if (!zcash) return () => {}

    // Noir sends null on a lock or a revoked approval, and otherwise only the
    // primary account, so the full list is read again
    const handler = async (addresses: ZcashAddress | null) => {
      const result = addresses
        ? await zcash.getAccounts().catch(() => null)
        : null
      const accounts = result ? toWalletAccounts(result, this.provider) : []

      this.setAccounts(accounts)
      callback(accounts)
    }

    zcash.on("accountsChanged", handler)
    return () => zcash.removeListener("accountsChanged", handler)
  }

  // Noir keeps the site's approval, as other extensions do, so connecting
  // again comes back without a prompt
  disconnect = () => {
    this._enabled = false
    this._extension = undefined
    this._accounts = []
  }
}
