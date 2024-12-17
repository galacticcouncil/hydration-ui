import { create } from "zustand"

import BinanceLogo from "assets/icons/BinanceLogo.svg?react"
import CoinbaseLogo from "assets/icons/CoinbaseLogo.svg?react"
import KrakenLogo from "assets/icons/KrakenLogoSmall.svg?react"
import KucoinLogo from "assets/icons/KucoinLogo.svg?react"
import { useModalPagination } from "components/Modal/Modal.utils"
import {
  AssetConfig,
  DepositMethod,
  DepositScreen,
} from "sections/deposit/types"

import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain, ParachainAssetData } from "@galacticcouncil/xcm-core"

const hydration = chainsMap.get("hydration") as EvmParachain

export const CEX_DEPOSIT_CONFIG = [
  {
    id: "kraken",
    title: "Kraken",
    icon: KrakenLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "0",
        route: ["hydration"],
        data: hydration.assetsData.get("hdx")!,
      },
    ],
  },
  {
    id: "binance",
    title: "Binance",
    icon: BinanceLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "kucoin",
    title: "KuCoin",
    icon: KucoinLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
      {
        assetId: "10",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdt")!,
      },
      {
        assetId: "22",
        route: ["assethub", "hydration"],
        data: hydration.assetsData.get("usdc")!,
      },
    ],
  },
  {
    id: "coinbase",
    title: "Coinbase",
    icon: CoinbaseLogo,
    assets: [
      {
        assetId: "5",
        route: ["polkadot", "hydration"],
        data: hydration.assetsData.get("dot")!,
      },
    ],
  },
]

console.log(CEX_DEPOSIT_CONFIG)

const DEFAULT_CEX_ID = CEX_DEPOSIT_CONFIG[0].id

type DepositStore = {
  asset: AssetConfig | null
  cexId: string
  depositMethod: DepositMethod | null
  isLoading: boolean
  depositedAmount: bigint
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setDepositMethod: (depositMethod: DepositMethod) => void
  setIsLoading: (isLoading: boolean) => void
  setDepositedAmount: (depositedAmount: bigint) => void
  reset: () => void
}

const initialState = {
  asset: null,
  cexId: DEFAULT_CEX_ID,
  depositMethod: null,
  isLoading: false,
  depositedAmount: 0n,
}

export const useDepositStore = create<DepositStore>((set) => ({
  ...initialState,
  setAsset: (asset) => set({ asset }),
  setCexId: (cexId) => set({ cexId }),
  setDepositMethod: (depositMethod) => set({ depositMethod }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setDepositedAmount: (depositedAmount) =>
    set({ depositedAmount, isLoading: false }),
  reset: () => set(initialState),
}))

export const useDeposit = () => {
  const pagination = useModalPagination()
  const state = useDepositStore()

  const setAsset = (asset: AssetConfig) => {
    state.setAsset(asset)
    pagination.paginateTo(DepositScreen.DepositAsset)
  }

  const setDepositMethod = (method: DepositMethod) => {
    state.setDepositMethod(method)
    pagination.paginateTo(DepositScreen.DepositMethod)
  }

  const setTransfer = () => {
    pagination.paginateTo(DepositScreen.Transfer)
  }

  const setSuccess = () => {
    pagination.paginateTo(DepositScreen.Success)
  }

  const reset = () => {
    state.reset()
    pagination.paginateTo(DepositScreen.Select)
  }

  return {
    ...state,
    ...pagination,
    reset,
    setAsset,
    setDepositMethod,
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
    default:
      return ""
  }
}
