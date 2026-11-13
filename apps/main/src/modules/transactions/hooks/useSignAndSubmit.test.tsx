// @vitest-environment jsdom
/*
 * Route selection of useSignAndSubmit. Non-strict: each master route is still
 * chosen for its inputs (permit, plain EVM, dispatch precompile, EVM.call
 * through a Polkadot signer). Strict: only the prepared send, whatever the
 * fee asset, including "0" (the value feeAssetId falls back to when the fee
 * estimate errored).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react"
import { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const routes = vi.hoisted(() => ({
  signAndSubmitEvmTx: vi.fn(async () => undefined),
  signAndSubmitEvmDispatchTx: vi.fn(async () => undefined),
  signAndSubmitPolkadotTx: vi.fn(async () => undefined),
  submitUnsignedPolkadotTx: vi.fn(async () => undefined),
  strict: vi.fn(async () => undefined),
  signer: null as unknown,
}))

vi.mock("@galacticcouncil/web3-connect", () => ({
  useWallet: () => ({ signer: routes.signer }),
  isEthereumSigner: (s: unknown) => (s as { kind?: string })?.kind === "eth",
  isPolkadotSigner: (s: unknown) => (s as { kind?: string })?.kind === "dot",
  isSolanaSigner: () => false,
  isSuiSigner: () => false,
  isNearSigner: () => false,
  isZecSigner: () => false,
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))
vi.mock("@/providers/rpcProvider", () => ({
  useRpcProvider: () => ({
    papi: {
      tx: {
        MultiTransactionPayment: {
          dispatch_permit: () => ({ __papi: true, permit: true }),
        },
        EVM: { call: () => ({ __papi: true, evmCall: true }) },
      },
    },
    papiClient: {},
  }),
}))
vi.mock("@/modules/transactions/utils/ethereum", () => ({
  signAndSubmitEvmTx: routes.signAndSubmitEvmTx,
  signAndSubmitEvmDispatchTx: routes.signAndSubmitEvmDispatchTx,
}))
vi.mock("@/modules/transactions/utils/polkadot", () => ({
  isPapiTransaction: (tx: unknown) => !!(tx as { __papi?: boolean })?.__papi,
  signAndSubmitPolkadotTx: routes.signAndSubmitPolkadotTx,
  submitUnsignedPolkadotTx: routes.submitUnsignedPolkadotTx,
  isDecodedCallEnum: () => false,
  isBatchDecodedCallValue: () => false,
}))
vi.mock("@/modules/transactions/utils/strictEvm", () => ({
  signAndSubmitStrictEvmTx: routes.strict,
}))
vi.mock("@/modules/transactions/utils/near", () => ({}))
vi.mock("@/modules/transactions/utils/solana", () => ({}))
vi.mock("@/modules/transactions/utils/sui", () => ({}))
vi.mock("@/modules/transactions/utils/zec", () => ({}))
vi.mock("@/api/evm", () => ({ weightToEvmFeeQuery: vi.fn() }))
vi.mock("@/api/transaction", () => ({ paymentInfoQuery: vi.fn() }))
vi.mock(
  "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils",
  () => ({ decodeTx: vi.fn() }),
)
vi.mock("@/api/external/common", () => ({
  getParachainFeeAssetLocation: vi.fn(),
}))

import { CallType } from "@galacticcouncil/xc-core"

import { useSignAndSubmit } from "@/modules/transactions/hooks/useSignAndSubmit"
import { TxOptions } from "@/modules/transactions/types"
import { SingleTransaction } from "@/states/transactions"

const A = "0x00000000000000000000000000000000000000a1"
const evmCall = {
  type: CallType.Evm,
  from: A,
  to: "0x00000000000000000000000000000000000000b2",
  data: "0x01",
  dryRun: async () => undefined,
}
const papiTx = { __papi: true, getEncodedData: async () => new Uint8Array([1]) }

const ethSigner = () => ({
  kind: "eth",
  getPermit: vi.fn(async () => ({
    message: {
      data: "0x01",
      from: A,
      to: A,
      value: 0,
      gaslimit: 1,
      deadline: 1,
    },
    signature: { v: 27n, r: "0x01", s: "0x01" },
  })),
})
const dotSigner = () => ({ kind: "dot" })

const run = async (
  transaction: Partial<SingleTransaction>,
  signer: unknown,
  feeAssetId: string,
) => {
  routes.signer = signer
  const client = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(
    () => useSignAndSubmit(transaction as SingleTransaction, {}),
    { wrapper },
  )
  await result.current
    .mutateAsync({
      chainKey: "hydration",
      feeAssetId,
      mortalityPeriod: 512,
      onSubmitted: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
      onFinalized: vi.fn(),
    } as TxOptions)
    .catch(() => undefined)
}

const chosen = () => ({
  plain: routes.signAndSubmitEvmTx.mock.calls.length,
  dispatch: routes.signAndSubmitEvmDispatchTx.mock.calls.length,
  polkadot: routes.signAndSubmitPolkadotTx.mock.calls.length,
  unsigned: routes.submitUnsignedPolkadotTx.mock.calls.length,
  strict: routes.strict.mock.calls.length,
})

beforeEach(() => vi.clearAllMocks())

describe("non-strict routes, as on master", () => {
  it("EVM call, Ethereum signer, fee asset not WETH: Call Permit", async () => {
    const signer = ethSigner()
    await run({ tx: evmCall }, signer, "0")
    expect(signer.getPermit).toHaveBeenCalledTimes(1)
    expect(chosen()).toEqual({
      plain: 0,
      dispatch: 0,
      polkadot: 0,
      unsigned: 1,
      strict: 0,
    })
  })
  it("EVM call, Ethereum signer, fee asset WETH: plain EVM send", async () => {
    const signer = ethSigner()
    await run({ tx: evmCall }, signer, "20")
    expect(signer.getPermit).not.toHaveBeenCalled()
    expect(chosen()).toEqual({
      plain: 1,
      dispatch: 0,
      polkadot: 0,
      unsigned: 0,
      strict: 0,
    })
  })
  it("Substrate extrinsic, Ethereum signer, fee asset WETH: dispatch precompile", async () => {
    await run({ tx: papiTx as never }, ethSigner(), "20")
    expect(chosen()).toEqual({
      plain: 0,
      dispatch: 1,
      polkadot: 0,
      unsigned: 0,
      strict: 0,
    })
  })
  it("Substrate extrinsic, Ethereum signer, fee asset not WETH: Call Permit", async () => {
    const signer = ethSigner()
    await run({ tx: papiTx as never }, signer, "5")
    expect(signer.getPermit).toHaveBeenCalledTimes(1)
    expect(chosen()).toEqual({
      plain: 0,
      dispatch: 0,
      polkadot: 0,
      unsigned: 1,
      strict: 0,
    })
  })
  it("EVM call, Polkadot signer: EVM.call extrinsic", async () => {
    await run({ tx: evmCall }, dotSigner(), "0")
    expect(routes.signAndSubmitPolkadotTx.mock.calls[0]![0]).toEqual({
      __papi: true,
      evmCall: true,
    })
    expect(chosen()).toEqual({
      plain: 0,
      dispatch: 0,
      polkadot: 1,
      unsigned: 0,
      strict: 0,
    })
  })
})

describe("strict route", () => {
  const strict = {
    tx: evmCall,
    strictEvm: {
      prepared: {
        chainId: 222222,
        from: A,
        to: evmCall.to,
        data: "0x01",
        value: "0x0",
      },
      sessionAddress: A,
      wrapRefusal: null,
    },
  }
  it.each(["0", "5", "20"])(
    "fee asset %s: the strict send only, never a permit or another route",
    async (fee) => {
      const signer = ethSigner()
      await run(strict, signer, fee)
      expect(signer.getPermit).not.toHaveBeenCalled()
      expect(chosen()).toEqual({
        plain: 0,
        dispatch: 0,
        polkadot: 0,
        unsigned: 0,
        strict: 1,
      })
    },
  )
  it("a Polkadot signer goes to the strict send (which refuses it), never EVM.call", async () => {
    await run(strict, dotSigner(), "0")
    expect(chosen()).toEqual({
      plain: 0,
      dispatch: 0,
      polkadot: 0,
      unsigned: 0,
      strict: 1,
    })
  })
})
