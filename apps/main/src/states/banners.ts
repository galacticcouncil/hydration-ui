import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import type { ParseKeys } from "i18next"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { useHasFillableStableBondsOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

type BannerConfig = Omit<PromoteBannerItem, "title" | "description"> & {
  title: ParseKeys<"common">
  description?: ParseKeys<"common">
  to?: string
  priority: number
  enabled: boolean
}

const bannerEntries: BannerConfig[] = [
  {
    id: "hollarb",
    backgroundImage: "/images/hollarb.webp",
    backgroundImageMobile: "/images/hollarbMobile.webp",
    title: "banners.hollarb.title",
    description: "banners.hollarb.description",
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
  const { t } = useTranslation("common")
  const { featureFlags } = useRpcProvider()
  const hasFillableStableBondsOrders = useHasFillableStableBondsOrders()
  const { timeLeft } = useBondData(HOLLAR_BOND_25_08_26_ID)
  const apr = getBondApr(HOLLAR_BOND_25_08_26_ID, timeLeft)

  return useMemo(() => {
    return bannerEntries
      .filter((banner) => {
        if (banner.id === "hollarb") {
          return featureFlags.hollarBondsEnabled && hasFillableStableBondsOrders
        }

        return banner.enabled
      })
      .map((banner) => {
        const description = (() => {
          if (banner.id === "hollarb" && banner.description) {
            return apr ? t(banner.description, { apr }) : ""
          }

          if (banner.description) {
            return t(banner.description)
          }

          return undefined
        })()
        return {
          ...banner,
          title: t(banner.title),
          description,
        }
      })
  }, [apr, featureFlags.hollarBondsEnabled, hasFillableStableBondsOrders, t])
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
