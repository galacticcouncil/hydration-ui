import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { LINKS } from "@/config/navigation"
import { useHasFillableStableBondsOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { useRpcProvider } from "@/providers/rpcProvider"

type BannerConfig = PromoteBannerItem & {
  to?: string
  priority: number
  enabled: boolean
}

const bannerEntries: BannerConfig[] = [
  {
    id: "hollarb",
    backgroundImage: "/images/hollarb.webp",
    backgroundImageMobile: "/images/hollarbMobile.webp",
    title: "Introducing fixed yield Hollar bonds",
    description: "Earn 6.9% APR with fixed-term HOLLAR bonds.",
    textColor: "#FFF",
    ctaColor: "#B3D7FA",
    ctaTextColor: "#0D1525",
    cta: "Get HOLLARb",
    to: LINKS.strategiesHollarBonds,
    priority: 1,
    enabled: false,
  },
]

export const useEnabledBanners = () => {
  const { featureFlags } = useRpcProvider()
  const hasFillableStableBondsOrders = useHasFillableStableBondsOrders()

  return useMemo(() => {
    return bannerEntries.filter((banner) => {
      if (banner.id === "hollarb") {
        return featureFlags.hollarBondsEnabled && hasFillableStableBondsOrders
      }

      return banner.enabled
    })
  }, [featureFlags.hollarBondsEnabled, hasFillableStableBondsOrders])
}

export const bannerConfig: BannerConfig[] = [...bannerEntries].sort(
  (a, b) => a.priority - b.priority,
)

type BannerType = "top" | "flow"

type BannersState = {
  banners: {
    ["new-farms"]: { visible?: boolean; type: BannerType; timestamp?: number }
  }
  closedGigaNewsIds: string[]
}

type BannersActions = {
  setBannerVisible: (
    id: keyof BannersState["banners"],
    visible: boolean,
    timestamp?: number,
  ) => void
  closeGigaNews: (id: string) => void
  openAllGigaNews: () => void
  closeAllGigaNews: () => void
}

type BannersStore = BannersState & BannersActions

const defaultState: BannersState = {
  banners: {
    ["new-farms"]: { visible: undefined, type: "top" },
  },
  closedGigaNewsIds: [],
}

export const useBannersStore = create<BannersStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setBannerVisible: (id, visible, timestamp) =>
        set((state) => {
          return {
            ...state,
            banners: {
              ...state.banners,
              [id]: { ...state.banners[id], visible, timestamp },
            },
          }
        }),
      closeGigaNews: (id) =>
        set((state) => {
          if (state.closedGigaNewsIds.includes(id)) return state

          return {
            ...state,
            closedGigaNewsIds: [...state.closedGigaNewsIds, id],
          }
        }),
      openAllGigaNews: () =>
        set((state) => {
          return {
            ...state,
            closedGigaNewsIds: [],
          }
        }),
      closeAllGigaNews: () =>
        set((state) => {
          return {
            ...state,
            closedGigaNewsIds: bannerConfig.map((banner) => banner.id),
          }
        }),
    }),
    {
      name: "banners",
      version: 2,
    },
  ),
)
