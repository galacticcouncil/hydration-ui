import {
  EvmAddr,
  NearAddr,
  shortenAccountAddress,
  withTimeout,
} from "@galacticcouncil/utils"
import {
  NearConnector,
  type NearWalletBase,
  SandboxWallet,
} from "@hot-labs/near-connect"

import { WalletProviderType } from "@/config/providers"
import { NearSigner } from "@/signers/NearSigner"
import { Wallet, WalletAccount } from "@/types/wallet"
import { BaseWalletError, UserRejectedError } from "@/utils/errors"
import { getNearErrorMessage } from "@/utils/near"

const NETWORK = "mainnet"
const MANIFEST_TIMEOUT_MS = 10_000

let connector: NearConnector | undefined

/** One connector for every NEAR wallet; a wallet's code loads when called. */
const getNearConnector = (): NearConnector => {
  connector ??= new NearConnector({
    network: NETWORK,
    // Connect only from the modal, never when an extension announces itself
    autoConnect: false,
    footerBranding: null,
  })
  return connector
}

const isTimeoutError = (err: unknown): err is Error =>
  err instanceof Error && err.name === "TimeoutError"

// near-connect rejects with "Wallet closed" when its popup is dismissed
const isRejection = (message: string) =>
  /reject|cancel|closed|denied/i.test(message)

const toAccountName = (accountId: string) =>
  NearAddr.isImplicit(accountId) || EvmAddr.isValid(accountId)
    ? shortenAccountAddress(accountId)
    : accountId

export class BaseNearWallet implements Wallet {
  provider = "" as WalletProviderType
  /** Wallet id in the near-connect manifest. */
  accessor = ""
  title = ""
  installUrl = ""
  logo = ""

  _wallet: NearWalletBase | undefined
  _signer: NearSigner | undefined
  _enabled: boolean = false

  _accounts: WalletAccount[] = []

  // near-connect runs web wallets on demand, so none need an extension
  get installed() {
    return true
  }

  get enabled() {
    return this._enabled
  }

  get extension() {
    return this._wallet
  }

  get signer() {
    return this._signer
  }

  transformError = (err: unknown): Error => {
    if (err instanceof BaseWalletError) return err

    // Kept as is, so a restore that runs out of time is marked unavailable
    // rather than dropped
    if (isTimeoutError(err)) return err

    const message = getNearErrorMessage(err)
    if (isRejection(message)) return new UserRejectedError(this)

    return new BaseWalletError(
      this,
      message || `${this.title} could not be connected.`,
    )
  }

  /** Connects from the modal, signing in when the wallet holds no session. */
  enable = () => this.connect(true)

  /** Brings back a stored session on reload, without ever opening the wallet. */
  restore = () => this.connect(false)

  private connect = async (signIn: boolean) => {
    const nearConnector = getNearConnector()

    try {
      const wallet = await withTimeout(
        nearConnector.wallet(this.accessor),
        MANIFEST_TIMEOUT_MS,
        `${this.title} didn't respond`,
      )

      // A stored session comes back silently; only signing in opens the wallet
      let accounts = await wallet.getAccounts({ network: NETWORK })
      if (!accounts.length && signIn) {
        accounts = await wallet.signIn({ network: NETWORK })
      }

      // Intear resolves an empty list when its popup is closed
      if (!accounts.length) throw new UserRejectedError(this)

      this._wallet = wallet
      this._signer = new NearSigner(wallet)
      this._enabled = true

      this.setAccounts(
        accounts.map(({ accountId }) => ({
          address: accountId,
          name: toAccountName(accountId),
          provider: this.provider,
        })),
      )
    } catch (err: unknown) {
      // No wallets means the manifest never loaded; fetch it again next time
      if (!nearConnector.wallets.length && connector === nearConnector) {
        connector = undefined
      }

      throw this.transformError(err)
    }
  }

  setAccounts = (accounts: WalletAccount[]) => {
    this._accounts = accounts
  }

  getAccounts = async (): Promise<WalletAccount[]> => {
    return this._accounts
  }

  // near-connect wallets answer calls but push no account events
  subscribeAccounts = () => () => {}

  disconnect = () => {
    const wallet = this._wallet

    this._enabled = false
    this._wallet = undefined
    this._signer = undefined
    this._accounts = []

    // Drops the stored session without running the wallet's own sign out,
    // which opens a popup in some wallets; a reconnect then asks again
    if (wallet instanceof SandboxWallet) {
      wallet.executor.clearStorage().catch(() => {})
    }
  }
}
