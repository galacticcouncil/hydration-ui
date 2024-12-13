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
import { EvmParachain } from "@galacticcouncil/xcm-core"

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

type DepositStore = {
  asset: AssetConfig | null
  cexId: string
  depositMethod: DepositMethod | null
  setAsset: (asset: AssetConfig) => void
  setCexId: (cexId: string) => void
  setDepositMethod: (depositMethod: DepositMethod) => void
}

export const useDepositStore = create<DepositStore>((set) => ({
  asset: CEX_DEPOSIT_CONFIG[0].assets[0],
  cexId: CEX_DEPOSIT_CONFIG[0].id,
  depositMethod: null,
  setAsset: (asset) => set(() => ({ asset })),
  setCexId: (cexId) => set(() => ({ cexId })),
  setDepositMethod: (depositMethod) => set(() => ({ depositMethod })),
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

  const paginateToTransfer = () => {
    pagination.paginateTo(DepositScreen.Transfer)
  }

  const finalizeDeposit = () => {
    // empty for now
  }

  return {
    ...state,
    ...pagination,
    setAsset,
    setDepositMethod,
    finalizeDeposit,
    paginateToTransfer,
  }
}
