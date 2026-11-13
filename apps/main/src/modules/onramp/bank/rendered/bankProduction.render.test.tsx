// @vitest-environment jsdom
/*
 * Review 4a B1: on a production build no way in renders a bank screen. With
 * `@/config/env` set to production: the Deposits nav child is off, the
 * /portfolio/deposits route is a 404 before its page loads, DepositPage and
 * WithdrawPage render no bank flow even when their state says DepositBank /
 * WithdrawBank (a stored page or a Portfolio tile), and BankFlow and
 * BankPortfolio render nothing themselves.
 */
import { isNotFound } from "@tanstack/react-router"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/config/env", () => ({
  ENV: { VITE_ENV: "production", VITE_HBR_API_URL: "https://hbr.test" },
}))
vi.mock("@galacticcouncil/ui/components", () => import("./uiKitStub"))
vi.mock("@galacticcouncil/web3-connect", () => ({
  useAccount: () => ({ account: null }),
  useWallet: () => ({ signer: null }),
  isEthereumSigner: () => false,
  useWeb3ConnectModal: () => ({ toggle: () => {} }),
  WalletMode: { EVM: "evm" },
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}))
vi.mock("@/i18n", () => ({ default: { t: (k: string) => k } }))

// The pages' other steps are replaced; the bank steps are markers.
vi.mock("@/modules/onramp/deposit/steps/DepositBank", () => ({
  DepositBank: () => <i data-marker="deposit-bank" />,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawBank", () => ({
  WithdrawBank: () => <i data-marker="withdraw-bank" />,
}))
vi.mock("@/modules/onramp/deposit/steps/DepositAsset", () => ({
  DepositAsset: () => null,
}))
vi.mock("@/modules/onramp/deposit/steps/DepositCexSelect", () => ({
  DepositCexSelect: () => null,
}))
vi.mock("@/modules/onramp/deposit/steps/DepositMethodSelect", () => ({
  DepositMethodSelect: () => null,
}))
vi.mock("@/modules/onramp/deposit/steps/DepositSuccess", () => ({
  DepositSuccess: () => null,
}))
vi.mock("@/modules/onramp/deposit/steps/DepositTransfer", () => ({
  DepositTransfer: () => null,
}))
vi.mock("@/modules/onramp/components/PendingDeposit", () => ({
  PendingDeposit: () => null,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawCexSelect", () => ({
  WithdrawCexSelect: () => null,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawMethodSelect", () => ({
  WithdrawMethodSelect: () => null,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawSuccess", () => ({
  WithdrawSuccess: () => null,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawTransfer", () => ({
  WithdrawTransfer: () => null,
}))
vi.mock("@/modules/onramp/withdraw/steps/WithdrawTransferOnchain", () => ({
  WithdrawTransferOnchain: () => null,
}))
vi.mock("@galacticcouncil/ui/utils", () => ({
  getToken: () => "",
  pxToRem: (px: number) => `${px / 16}rem`,
}))
vi.mock(
  "@galacticcouncil/ui/assets/icons",
  () =>
    new Proxy(
      {},
      {
        get: (_t, key) => (key === "then" ? undefined : () => null),
        has: (_t, key) => key !== "then",
      },
    ),
)
const page = vi.hoisted(() => ({ current: "" }))
vi.mock("@/modules/onramp/deposit/hooks/useDeposit", () => ({
  useDeposit: () => ({ page: page.current, asset: null, reset: () => {} }),
}))
vi.mock("@/modules/onramp/withdraw/hooks/useWithdraw", () => ({
  useWithdraw: () => ({ page: page.current, asset: null, reset: () => {} }),
}))
vi.mock("@/modules/onramp/store/useOnrampStore", () => ({
  useOnrampStore: () => [],
  selectPendingDepositsByAccount: () => () => [],
}))

import { ENV } from "@/config/env"
import { NAVIGATION } from "@/config/navigation"
import { BankFlow } from "@/modules/onramp/bank/components/BankFlow"
import { BankPortfolio } from "@/modules/onramp/bank/components/BankPortfolio"
import { isBankFlowEnabled } from "@/modules/onramp/bank/utils/bankAvailability"
import { DepositPage } from "@/modules/onramp/deposit/DepositPage"
import { OnrampScreen } from "@/modules/onramp/types"
import { WithdrawPage } from "@/modules/onramp/withdraw/WithdrawPage"
import { Route as DepositsRoute } from "@/routes/portfolio/deposits"

describe("production: no bank screen by any way in (review 4a B1)", () => {
  it("the gate reads production as off", () => {
    expect(isBankFlowEnabled()).toBe(false)
  })

  it("the Deposits nav child is off", () => {
    const portfolio = NAVIGATION.find((item) => item.key === "portfolio")
    const deposits = portfolio?.children?.find(
      (child) => child.key === "portfolioDeposits",
    )
    expect(deposits).toBeDefined()
    expect(deposits?.enabled).toBe(false)
  })

  it("/portfolio/deposits is a 404 before its page loads", () => {
    const beforeLoad = DepositsRoute.options.beforeLoad as unknown as () => void
    let thrown: unknown = null
    try {
      beforeLoad()
    } catch (e) {
      thrown = e
    }
    expect(isNotFound(thrown)).toBe(true)
  })

  it("DepositPage on DepositBank renders no bank flow", () => {
    page.current = OnrampScreen.DepositBank
    const { container } = render(<DepositPage />)
    expect(container.querySelector("[data-marker]")).toBeNull()
  })

  it("WithdrawPage on WithdrawBank renders no bank flow", () => {
    page.current = OnrampScreen.WithdrawBank
    const { container } = render(<WithdrawPage />)
    expect(container.querySelector("[data-marker]")).toBeNull()
  })

  it("BankFlow and BankPortfolio render nothing", () => {
    const flow = render(<BankFlow direction="deposit" />)
    expect(flow.container.innerHTML).toBe("")
    const tiles = render(<BankPortfolio onOpen={() => {}} />)
    expect(tiles.container.innerHTML).toBe("")
  })

  // Positive control: the same render outside production shows the marker,
  // so the two page tests above can see a bank flow when one renders.
  it("control: outside production the pages do render their bank step", () => {
    const env = ENV as { VITE_ENV: string }
    env.VITE_ENV = "testnet"
    try {
      page.current = OnrampScreen.DepositBank
      const d = render(<DepositPage />)
      expect(
        d.container.querySelector('[data-marker="deposit-bank"]'),
      ).not.toBeNull()
      page.current = OnrampScreen.WithdrawBank
      const w = render(<WithdrawPage />)
      expect(
        w.container.querySelector('[data-marker="withdraw-bank"]'),
      ).not.toBeNull()
    } finally {
      env.VITE_ENV = "production"
    }
  })
})
