import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  SubmittedDeposit,
  useDepositJourneyStore,
} from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { OnrampScreen } from "@/modules/onramp/types"

import { DepositVariant, useOnrampModal, WithdrawFlow } from "./useOnrampModal"

const wallet = vi.hoisted(() => ({
  account: null as Account | null,
  accounts: [] as Account[],
  getStatus: vi.fn(() => "connected"),
}))
const paginateTo = vi.hoisted(() => vi.fn())
vi.mock("@galacticcouncil/utils", () => ({
  isAddressValidOnHydration: () => true,
}))
vi.mock("@galacticcouncil/web3-connect", () => ({
  useWeb3Connect: { getState: () => wallet },
  toAccount: (account: Account) => account,
  WalletProviderStatus: { Connected: "connected" },
}))
vi.mock("zustand/middleware", () => ({ persist: (state: unknown) => state }))
vi.mock("./useOnrampStore", () => ({
  useOnrampStore: { getState: () => ({ paginateTo }) },
}))

const recipient = {
  name: "Main",
  address: "main",
  rawAddress: "main",
  displayAddress: "main",
  publicKey: "main",
  provider: WalletProviderType.Talisman,
  canUseOnHydration: true,
} satisfies Account
const transfer = {
  txHash: "pending-transfer",
  sourceAddress: "source",
  destinationAddress: "main",
  sourceChainKey: "ethereum",
  symbol: "USDC",
  amount: "25",
  receivedAmount: "24.9",
  receivedSymbol: "USDC",
  sentAt: 100,
  settled: false,
} satisfies SubmittedDeposit
const modal = () => useOnrampModal.getState()
const journey = () => useDepositJourneyStore.getState()

beforeEach(() => {
  useOnrampModal.setState(useOnrampModal.getInitialState(), true)
  useDepositJourneyStore.setState(
    useDepositJourneyStore.getInitialState(),
    true,
  )
  wallet.account = null
  wallet.accounts = []
  wallet.getStatus.mockReset().mockReturnValue("connected")
  paginateTo.mockReset()
})

describe("on-chain deposit design variants", () => {
  it.each(["current", "guided", "simple", "connected", "choice"] as const)(
    "selects %s on the main modal without starting a flow or losing pending transfers",
    (flow) => {
      journey().setSubmitted(transfer)
      modal().setModal("deposit")
      paginateTo.mockClear()

      modal().setDepositEntryFlow(flow)

      expect(modal()).toMatchObject({
        modal: "deposit",
        depositEntryFlow: flow,
        depositEntryChoice: flow === "choice",
      })
      expect(paginateTo).not.toHaveBeenCalled()
      expect(journey().active).toBe(false)
      expect(journey().pendingTransfers).toEqual([transfer])
    },
  )

  it.each(["current", "guided", "simple", "connected", "choice"] as const)(
    "opens the selected %s version when the on-chain method is chosen",
    (flow) => {
      modal().setModal("deposit")
      modal().setDepositEntryFlow(flow)
      modal().openSelectedDepositFlow()

      const walletFirst = ["current", "connected", "choice"].includes(flow)
      expect(modal().modal).toBe(
        walletFirst ? "depositOnchain" : "depositOnchainPreview",
      )
      expect(modal().depositEntryChoice).toBe(flow === "choice")
      if (walletFirst)
        expect(modal().walletFirstFlow).toBe(
          flow === "choice" ? "connected" : flow,
        )
      else expect(modal().depositFlow).toBe(flow)
    },
  )

  it("opens the fifth version at method selection without losing pending transfers", () => {
    journey().setSubmitted(transfer)
    modal().setWalletFirstAsset({ chainKey: "bifrost", assetKey: "bnc" })

    modal().openDepositChoice()

    expect(modal()).toMatchObject({
      modal: "deposit",
      depositEntryChoice: true,
      walletFirstAsset: null,
    })
    expect(paginateTo).toHaveBeenCalledWith(OnrampScreen.MethodSelect)
    expect(journey().active).toBe(false)
    expect(journey().pendingTransfers).toEqual([transfer])
  })

  it.each(["connected", "simple"] as const)(
    "uses the existing %s flow inside the fifth version and returns to its entry choice",
    (flow) => {
      modal().openDepositChoice()
      modal().openOnchain(flow, { entryChoice: true })

      expect(modal().depositEntryChoice).toBe(true)
      expect(modal().modal).toBe(
        flow === "connected" ? "depositOnchain" : "depositOnchainPreview",
      )
      if (flow === "connected")
        expect(modal().walletFirstFlow).toBe("connected")
      else {
        expect(modal().depositFlow).toBe("simple")
        expect(journey().phase).toBe("assets")
      }

      modal().setModal("deposit")
      expect(modal()).toMatchObject({
        modal: "deposit",
        depositEntryChoice: true,
      })
    },
  )

  it.each(["current", "guided", "simple", "connected"] as const)(
    "leaves the fifth entry context when explicitly switching to %s",
    (flow) => {
      modal().openDepositChoice()
      modal().openOnchain("simple", { entryChoice: true })
      modal().openOnchain(flow)
      expect(modal().depositEntryChoice).toBe(false)
    },
  )

  it.each(["current", "connected"] as const)(
    "keeps the %s asset selection during navigation, then clears it for a new deposit",
    (flow) => {
      const selection = { chainKey: "bifrost", assetKey: "bnc" }
      modal().openOnchain(flow)
      modal().setWalletFirstAsset(selection)
      modal().setModal("depositOnchain")
      expect(modal().walletFirstAsset).toEqual(selection)

      modal().setModal(null)
      expect(modal().walletFirstAsset).toBeNull()

      modal().setWalletFirstAsset(selection)
      modal().openOnchain(flow)
      expect(modal().walletFirstAsset).toBeNull()
    },
  )

  it.each([
    ["preview", "guided", "catalog"],
    ["guided", "guided", "catalog"],
    ["simple", "simple", "assets"],
  ] as const)(
    "opens %s at its entry stage without requiring a connected wallet",
    (flow, visibleFlow, phase) => {
      modal().openOnchain(flow)
      expect(modal()).toMatchObject({
        modal: "depositOnchainPreview",
        depositFlow: visibleFlow,
      })
      expect(journey()).toMatchObject({
        active: true,
        phase,
        selection: null,
        destinationConfirmed: false,
      })
    },
  )

  it.each(["guided", "simple"] as const)(
    "opens a portfolio asset in %s with its source chain already selected",
    (flow) => {
      const assetIntent = { chainKey: "bifrost", assetKey: "bnc" }
      modal().openOnchain(flow, { assetIntent })

      expect(modal()).toMatchObject({
        modal: "depositOnchainPreview",
        depositFlow: flow,
      })
      expect(journey()).toMatchObject({
        active: true,
        phase: "sources",
        assetIntent,
        selection: null,
        amount: "",
      })
    },
  )

  it("does not replace a pending transfer with a portfolio asset selection", () => {
    journey().setSubmitted(transfer)
    modal().openOnchain("guided", {
      assetIntent: { chainKey: "bifrost", assetKey: "bnc" },
    })

    expect(journey()).toMatchObject({
      phase: "tracking",
      submitted: transfer,
      assetIntent: null,
    })
  })

  it("keeps a confirmed connected recipient when changing designs, while clearing old source and amount", () => {
    wallet.account = recipient
    wallet.accounts = [recipient]
    journey().setDestination(recipient.address, recipient)
    journey().setSelection({
      account: recipient,
      chainKey: "ethereum",
      assetKey: "usdc",
    })
    journey().setAmount("99")

    modal().openOnchain("guided")

    expect(journey()).toMatchObject({
      phase: "catalog",
      destinationAddress: recipient.address,
      destinationAccount: recipient,
      destinationConfirmed: true,
      suggestedDestinationAccount: recipient,
      selection: null,
      amount: "",
    })
  })

  it.each(["guided", "simple"] satisfies DepositVariant[])(
    "reconfirms a disconnected saved recipient in %s",
    (flow) => {
      journey().setDestination(recipient.address, recipient)
      wallet.getStatus.mockReturnValue("disconnected")
      modal().openOnchain(flow)
      expect(journey()).toMatchObject({
        destinationAccount: null,
        destinationAddress: "",
        destinationConfirmed: false,
      })
    },
  )

  it.each(["preview", "guided", "simple"] satisfies DepositVariant[])(
    "preserves the active pending transfer and tracking when changing to %s",
    (flow) => {
      journey().setSubmitted(transfer)
      modal().openOnchain(flow)
      expect(modal().depositFlow).toBe(flow === "preview" ? "guided" : flow)
      expect(journey()).toMatchObject({
        active: true,
        phase: "tracking",
        submitted: transfer,
        pendingTransfers: [transfer],
      })
    },
  )

  it("resumes the requested pending transaction without replacing it with the latest one", () => {
    const latest = { ...transfer, txHash: "latest-transfer" }
    journey().setSubmitted(transfer)
    journey().depositMore()
    journey().setSubmitted(latest)

    modal().openOnchain("simple", { resume: true, txHash: transfer.txHash })

    expect(journey().phase).toBe("tracking")
    expect(journey().submitted).toEqual(transfer)
    expect(journey().pendingTransfers).toEqual([transfer, latest])
  })

  it.each(["current", "connected"] as const)(
    "keeps the %s wallet-first flow separate without discarding pending transfers",
    (flow) => {
      journey().setSubmitted(transfer)
      modal().openOnchain(flow)
      expect(modal()).toMatchObject({
        modal: "depositOnchain",
        walletFirstFlow: flow,
      })
      expect(paginateTo).toHaveBeenCalledWith(OnrampScreen.DepositOnchainWallet)
      expect(journey().active).toBe(false)
      expect(journey().pendingTransfers).toEqual([transfer])
    },
  )

  it("restores the original picker when switching back from connected-wallets v4", () => {
    modal().openOnchain("connected")
    modal().openOnchain("current")

    expect(modal()).toMatchObject({
      modal: "depositOnchain",
      walletFirstFlow: "current",
    })
  })
})

describe("on-chain withdrawal design variants", () => {
  const selection = {
    assetId: "0",
    sourceAssetKey: "hdx",
    destinationChainKey: "robinhood",
    destinationAssetKey: "hdx",
  }

  it("keeps the active withdrawal route while a transfer is pending and allows switching after it settles", () => {
    modal().openWithdrawOnchain("guided")
    modal().selectWithdrawAsset(selection)
    useOnrampModal.setState({ withdrawPending: true })

    modal().openWithdrawOnchain("simple")

    expect(modal()).toMatchObject({
      modal: "withdrawOnchain",
      withdrawFlow: "guided",
      withdrawPage: OnrampScreen.WithdrawOnchainForm,
      withdrawAssetId: selection.assetId,
      withdrawSelection: selection,
      withdrawPending: true,
    })

    useOnrampModal.setState({ withdrawPending: false })
    modal().openWithdrawOnchain("simple")

    expect(modal()).toMatchObject({
      modal: "withdrawAsset",
      withdrawFlow: "simple",
      withdrawPage: OnrampScreen.WithdrawOnchainAsset,
      withdrawAssetId: null,
      withdrawSelection: null,
      withdrawPending: false,
    })
  })

  it.each([
    ["current", "withdrawOnchain", OnrampScreen.WithdrawOnchainWallet],
    ["connected", "withdrawOnchain", OnrampScreen.WithdrawOnchainWallet],
    ["guided", "withdrawAsset", OnrampScreen.WithdrawOnchainAsset],
    ["simple", "withdrawAsset", OnrampScreen.WithdrawOnchainAsset],
  ] as const)(
    "opens %s at its entry step and clears the previous asset and destination",
    (flow, modalType, page) => {
      journey().setSubmitted(transfer)
      modal().selectWithdrawAsset(selection)

      modal().openWithdrawOnchain(flow)

      expect(modal()).toMatchObject({
        modal: modalType,
        withdrawFlow: flow,
        withdrawPage: page,
        withdrawAssetId: null,
        withdrawSelection: null,
      })
      expect(journey().active).toBe(false)
      expect(journey().pendingTransfers).toEqual([transfer])
    },
  )

  it("opens Guided steps by default without requiring a connected wallet", () => {
    modal().openWithdrawOnchain()

    expect(modal()).toMatchObject({
      modal: "withdrawAsset",
      withdrawFlow: "guided",
      withdrawPage: OnrampScreen.WithdrawOnchainAsset,
    })
  })

  it.each([
    "current",
    "guided",
    "simple",
    "connected",
  ] satisfies WithdrawFlow[])(
    "remembers %s after returning to withdrawal methods",
    (flow) => {
      modal().openWithdrawOnchain(flow)
      modal().selectWithdrawAsset(selection)
      modal().openWithdraw()
      modal().openWithdrawOnchain()

      expect(modal()).toMatchObject({
        withdrawFlow: flow,
        withdrawPage:
          flow === "current" || flow === "connected"
            ? OnrampScreen.WithdrawOnchainWallet
            : OnrampScreen.WithdrawOnchainAsset,
        withdrawAssetId: null,
        withdrawSelection: null,
      })
    },
  )

  it.each([
    "current",
    "guided",
    "simple",
    "connected",
  ] satisfies WithdrawFlow[])(
    "keeps %s when selecting an asset and its destination route",
    (flow) => {
      modal().openWithdrawOnchain(flow)
      modal().selectWithdrawAsset(selection)

      expect(modal()).toMatchObject({
        modal: "withdrawOnchain",
        withdrawFlow: flow,
        withdrawPage: OnrampScreen.WithdrawOnchainForm,
        withdrawAssetId: selection.assetId,
        withdrawSelection: selection,
      })
    },
  )

  it("keeps asset-only selection callers working without retaining an old route", () => {
    modal().openWithdrawOnchain("simple")
    modal().selectWithdrawAsset(selection)
    modal().selectWithdrawAsset("10")

    expect(modal()).toMatchObject({
      modal: "withdrawOnchain",
      withdrawFlow: "simple",
      withdrawPage: OnrampScreen.WithdrawOnchainForm,
      withdrawAssetId: "10",
      withdrawSelection: null,
    })
  })
})
