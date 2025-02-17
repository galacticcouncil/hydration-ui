import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain, ParachainAssetData } from "@galacticcouncil/xcm-core"
import BinanceLogo from "assets/icons/BinanceLogo.svg?react"
import CoinbaseLogo from "assets/icons/CoinbaseLogo.svg?react"
import KrakenLogo from "assets/icons/KrakenLogoSmall.svg?react"
import KucoinLogo from "assets/icons/KucoinLogo.svg?react"
import GateioLogo from "assets/icons/GateioLogo.svg?react"
import { BigNumber } from "bignumber.js"
import { useTranslation } from "react-i18next"
import {
  AssetConfig,
  DepositConfig,
  DepositMethod,
  DepositScreen,
} from "sections/deposit/types"
import { required, validAddress } from "utils/validators"
import { z } from "zod"
import { create } from "zustand"
import { usePrevious } from "react-use"
import { persist } from "zustand/middleware"

const hydration = chainsMap.get("hydration") as EvmParachain

export const CEX_CONFIG = [
  {
    id: "kraken",
    title: "Kraken",
    icon: KrakenLogo,
    isXcmCompatible: false,
    assets: [
      {
        assetId: "5",
        minDeposit: 2,
        withdrawalChain: "polkadot",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "0",
        withdrawalChain: "hydration",
        depositChain: "hydration",
        data: hydration.assetsData.get("hdx")!,
      },
    ],
  },
  {
    id: "binance",
    title: "Binance",
    isXcmCompatible: true,
    icon: BinanceLogo,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "polkadot",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "kucoin",
    title: "KuCoin",
    icon: KucoinLogo,
    isXcmCompatible: false,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "polkadot",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "coinbase",
    title: "Coinbase",
    icon: CoinbaseLogo,
    isXcmCompatible: false,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "polkadot",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
    ],
  },
  {
    id: "gateio",
    title: "Gate.io",
    icon: GateioLogo,
    isXcmCompatible: false,
    assets: [
      {
        assetId: "5",
        withdrawalChain: "polkadot",
        depositChain: "polkadot",
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        withdrawalChain: "assethub",
        depositChain: "assethub_cex",
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
]

export const CEX_DEPOSIT_LIMITS: Record<string, number> = {
  "5": 2.5,
  "0": 5,
  "10": 4,
  "22": 4,
}

export const CEX_WITHDRAW_LIMITS: Record<string, number> = {
  "5": 2.5,
  "0": 5,
  "10": 4,
  "22": 4,
}

const DEFAULT_CEX_ID = CEX_CONFIG[0].id

type TCreateDepositEntry = Omit<DepositConfig, "id" | "createdAt">

type DepositStore = {
  page: DepositScreen
  asset: AssetConfig | null
  cexId: string
  method: DepositMethod | null
  amount: string
  currentDeposit: DepositConfig | null
  pendingDeposits: DepositConfig[]
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setMethod: (method: DepositMethod) => void
  setAmount: (amount: string) => void
  setCurrentDeposit: (deposit: TCreateDepositEntry | null) => void
  setPendingDeposit: (deposit: TCreateDepositEntry) => void
  setFinishedDeposit: (id: string) => void
  paginateTo: (page: DepositScreen) => void
  paginateBack: () => void
  reset: () => void
}

const initialState = {
  page: DepositScreen.Select,
  asset: null,
  cexId: DEFAULT_CEX_ID,
  method: null,
  amount: "",
  currentDeposit: null,
  pendingDeposits: [],
}

export const useDepositStore = create(
  persist<DepositStore>(
    (set) => ({
      ...initialState,
      setAsset: (asset) => set({ asset }),
      setCexId: (cexId) => set({ cexId }),
      setMethod: (method) => set({ method }),
      setAmount: (amount) => set({ amount }),
      setCurrentDeposit: (deposit) =>
        set({
          currentDeposit: deposit
            ? {
                ...deposit,
                createdAt: Date.now(),
                id: createDepositId(deposit.asset.assetId, deposit.address),
              }
            : null,
        }),
      setPendingDeposit: (deposit) =>
        set((state) => {
          // remove previous deposit with the same id
          const filteredPendingDeposits = state.pendingDeposits.filter(
            ({ id }) =>
              id !== createDepositId(deposit.asset.assetId, deposit.address),
          )

          return {
            pendingDeposits: [
              ...filteredPendingDeposits,
              {
                ...deposit,
                createdAt: Date.now(),
                id: createDepositId(deposit.asset.assetId, deposit.address),
              },
            ],
          }
        }),
      setFinishedDeposit: (id) =>
        set((state) => ({
          pendingDeposits: state.pendingDeposits.filter(
            (deposit) => deposit.id !== id,
          ),
        })),
      paginateTo: (page) => set({ page }),
      paginateBack: () => set((state) => ({ page: state.page - 1 })),
      reset: () =>
        set((state) => ({
          ...initialState,
          pendingDeposits: state.pendingDeposits,
        })),
    }),
    {
      name: "deposit",
      version: 0.1,
      partialize: (state) => ({
        ...state,
        ...initialState,
        pendingDeposits: state.pendingDeposits,
      }),
    },
  ),
)

export const useDeposit = () => {
  const state = useDepositStore()

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    state.paginateTo(DepositScreen.DepositAsset)
  }

  const setMethod = (method: DepositMethod) => {
    state.setMethod(method)
    state.paginateTo(DepositScreen.Method)
  }

  const setTransfer = () => {
    state.paginateTo(DepositScreen.Transfer)
  }

  const setSuccess = () => {
    state.paginateTo(DepositScreen.Success)
  }

  const reset = () => {
    state.reset()
    state.paginateTo(DepositScreen.Select)
  }

  const previous = usePrevious(state.page)

  const direction = (previous ?? initialState.page) < state.page ? 1 : -1

  return {
    ...state,
    direction,
    reset,
    setAsset,
    setMethod,
    setTransfer,
    setSuccess,
  }
}

export const createCexWithdrawalUrl = (
  cexId: string,
  assetData: ParachainAssetData,
) => {
  const symbol = assetData.asset.originSymbol.toUpperCase()
  switch (cexId) {
    case "kraken":
      const network = symbol === "DOT" ? "Polkadot" : "Hydration"
      const method = symbol === "DOT" ? "Polkadot" : "HydraDX Network"
      return encodeURI(
        `https://www.kraken.com/c/funding/withdraw?asset=${symbol}&network=${network}&method=${method}`,
      )
    case "binance":
      return encodeURI(
        `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${symbol}`,
      )
    case "kucoin":
      return encodeURI(`https://www.kucoin.com/assets/withdraw/${symbol}`)
    case "coinbase":
      return `https://www.coinbase.com`
    case "gateio":
      return encodeURI(`https://www.gate.io/myaccount/withdraw/${symbol}`)
    default:
      return ""
  }
}

export const useTransferSchema = ({
  min,
  max,
  symbol,
  decimals,
}: {
  min: BigNumber
  max: BigNumber
  symbol: string
  decimals: number
}) => {
  const { t } = useTranslation()

  const maxBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).lte(max.shiftedBy(-decimals)),
    t("xcm.transfer.error.maxTransferable", {
      value: max,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  const minBalance = z.string().refine(
    (value) =>
      Number.isFinite(decimals) &&
      BigNumber(value).gte(min.shiftedBy(-decimals)),
    t("xcm.transfer.error.minTransferable", {
      value: min,
      fixedPointScale: decimals,
      symbol,
    }),
  )

  return z.object({
    amount: required.pipe(maxBalance).pipe(minBalance),
    address: validAddress,
  })
}

export const createDepositId = (assetId: string, address: string) =>
  `${assetId}-${address}`

export const selectPendingDepositsByAccount =
  (address?: string) => (state: DepositStore) =>
    address
      ? state.pendingDeposits.filter((deposit) => deposit.address === address)
      : []
