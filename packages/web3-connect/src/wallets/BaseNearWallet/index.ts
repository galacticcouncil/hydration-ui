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
  type WalletManifest,
} from "@hot-labs/near-connect"
import { z } from "zod/v4"

import { WalletProviderType } from "@/config/providers"
import { NearSigner } from "@/signers/NearSigner"
import { Wallet, WalletAccount } from "@/types/wallet"
import {
  BaseWalletError,
  getWalletErrorMessage,
  UserRejectedError,
} from "@/utils/errors"

const NETWORK = "mainnet"
const MANIFEST_TIMEOUT_MS = 10_000

const POPUP_WIDTH = 420
const POPUP_HEIGHT = 680

// near-connect registers only sandboxed wallets
const sandboxWalletSchema = z.looseObject({
  id: z.string(),
  type: z.literal("sandbox"),
  executor: z.url(),
})

const manifestSchema = z.object({
  wallets: z.array(
    z.custom<WalletManifest>(
      (wallet) => sandboxWalletSchema.safeParse(wallet).success,
    ),
  ),
})

let connector: NearConnector | undefined

// The extra manifests each connector holds, so each is fetched once
const registrations = new WeakMap<NearConnector, Map<string, Promise<void>>>()

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

/** Adds the wallets of a manifest beside the default list, as NEAR's docs do. */
const registerManifest = (nearConnector: NearConnector, url: string) => {
  const registered =
    registrations.get(nearConnector) ?? new Map<string, Promise<void>>()
  registrations.set(nearConnector, registered)

  let registration = registered.get(url)
  if (!registration) {
    registration = (async () => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`NEAR wallet manifest answered ${res.status}`)
      }

      const body: unknown = await res.json()
      const { wallets } = manifestSchema.parse(body)

      await nearConnector.whenManifestLoaded
      await Promise.all(
        wallets.map((wallet) => nearConnector.registerWallet(wallet)),
      )
    })()
    // A failed fetch is tried again on the next connect
    registration.catch(() => registered.delete(url))
    registered.set(url, registration)
  }

  return registration
}

const popupUrls = new Set<string>()

// Opened at the click, while the browser still allows a popup, for the
// wallet's page to load into once the wallet asks for it
let reservedPopup: Window | undefined

// Centred over the app window
const getPopupFeatures = () => {
  const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
  const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2
  return `popup,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${Math.round(left)},top=${Math.round(top)}`
}

const releasePopup = () => {
  reservedPopup?.close()
  reservedPopup = undefined
}

const reservePopup = () => {
  releasePopup()
  reservedPopup =
    window.open("about:blank", "_blank", getPopupFeatures()) ?? undefined
}

const takeReservedPopup = (href: string) => {
  const popup = reservedPopup
  reservedPopup = undefined
  if (!popup || popup.closed) return null

  popup.location.href = href
  return popup
}

/**
 * Opens a wallet's page as a popup when the wallet asks for it without a
 * size, which browsers open as a tab; near-connect passes the size on as is.
 */
const openAsPopup = (url: string) => {
  if (!popupUrls.size) {
    const open = window.open.bind(window)
    window.open = (target, name, features) => {
      const href = String(target ?? "")
      const isSizeless =
        !features && [...popupUrls].some((url) => href.startsWith(url))
      if (!isSizeless) return open(target, name, features)

      return takeReservedPopup(href) ?? open(target, name, getPopupFeatures())
    }
  }
  popupUrls.add(url)
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
  /** Manifest that lists the wallet, where NEAR's default one doesn't. */
  manifestUrl = ""
  /** Page the wallet opens without a size, to open as a popup, not a tab. */
  popupUrl = ""
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

  get hasExtension() {
    return false
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

    const message = getWalletErrorMessage(err)
    if (isRejection(message)) return new UserRejectedError(this)

    return new BaseWalletError(
      this,
      message || `${this.title} could not be connected.`,
    )
  }

  /** Readies what the wallet needs before it opens to sign in. */
  beforeSignIn = async (): Promise<void> => {}

  /** Connects from the modal, signing in when the wallet holds no session. */
  enable = () => this.connect(true)

  /** Brings back a stored session on reload, without ever opening the wallet. */
  restore = () => this.connect(false)

  private connect = async (signIn: boolean) => {
    const nearConnector = getNearConnector()
    if (signIn && this.popupUrl) reservePopup()

    try {
      const wallet = await withTimeout(
        this.loadWallet(nearConnector),
        MANIFEST_TIMEOUT_MS,
        `${this.title} didn't respond`,
      )

      // A stored session comes back silently; only signing in opens the wallet
      let accounts = await wallet.getAccounts({ network: NETWORK })
      if (!accounts.length && signIn) {
        await this.beforeSignIn()
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
    } finally {
      // Left over when a stored session came back or the wallet failed first
      releasePopup()
    }
  }

  private loadWallet = async (nearConnector: NearConnector) => {
    if (this.popupUrl) openAsPopup(this.popupUrl)
    if (this.manifestUrl) {
      await registerManifest(nearConnector, this.manifestUrl)
    }
    return nearConnector.wallet(this.accessor)
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
