import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { LINKS } from "@/config/navigation"
import { useHasFillableStableBondsOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { useRpcProvider } from "@/providers/rpcProvider"

export type BannerConfig = PromoteBannerItem & {
  to?: string
  priority: number
  enabled: boolean
}

const bannerEntries: BannerConfig[] = [
  {
    id: "bil",
    backgroundImage: "/images/bil.webp",
    backgroundImageMobile: "/images/bilMobile.webp",
    title: "banners.bil.title",
    description: "banners.bil.description",
    textColor: "#000000",
    ctaColor: "#000000",
    ctaTextColor: "#FFFFFF",
    cta: "banners.bil.cta",
    to: LINKS.strategiesBil,
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

      if (banner.id === "bil") {
        return featureFlags.bilEnabled
      }

      return banner.enabled
    })
  }, [
    featureFlags.bilEnabled,
    featureFlags.hollarBondsEnabled,
    hasFillableStableBondsOrders,
  ])
}

export const bannerConfig: BannerConfig[] = [...bannerEntries].sort(
  (a, b) => a.priority - b.priority,
)

type BannerType = "top" | "flow"

type BannersState = {
  banners: {
    ["new-farms"]: { visible?: boolean; type: BannerType; timestamp?: number }
    ["giga-stake"]: { visible?: boolean; type: BannerType; timestamp?: number }
    ["hollar-banner"]: {
      visible?: boolean
      type: BannerType
      timestamp?: number
    }
    ["giga-migration"]: {
      visible?: boolean
      type: BannerType
      timestamp?: number
    }
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
    ["giga-stake"]: { visible: undefined, type: "flow" },
    ["hollar-banner"]: { visible: undefined, type: "flow" },
    ["giga-migration"]: { visible: undefined, type: "flow" },
  },
  closedGigaNewsIds: [],
}

const bannerIds = Object.keys(
  defaultState.banners,
) as (keyof BannersState["banners"])[]

function mergePersistedWithDefaults(
  persistedState: unknown,
  currentState: BannersStore,
): BannersStore {
  const p = persistedState as Partial<BannersState> | undefined
  const banners = Object.fromEntries(
    bannerIds.map((id) => [
      id,
      {
        ...defaultState.banners[id],
        ...(p?.banners?.[id] ?? {}),
      },
    ]),
  ) as BannersState["banners"]

  return {
    ...currentState,
    banners,
    closedGigaNewsIds: p?.closedGigaNewsIds ?? defaultState.closedGigaNewsIds,
  }
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
      merge: mergePersistedWithDefaults,
      partialize: (state) => ({
        banners: state.banners,
        closedGigaNewsIds: state.closedGigaNewsIds,
      }),
    },
  ),
)
