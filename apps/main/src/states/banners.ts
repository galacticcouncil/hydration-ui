import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { type ParseKeys } from "i18next"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useBondData } from "@/api/bonds"
import { LINKS } from "@/config/navigation"
import { useStableBonds } from "@/modules/strategies/stable-bonds/hooks/useStableBonds"
import { useHasFillableStableBondsOrders } from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useRpcProvider } from "@/providers/rpcProvider"

type BannerTextKey = ParseKeys<"common">

export type EnabledBanner = PromoteBannerItem & { to?: string }

export type BannerConfig = Omit<
  EnabledBanner,
  "title" | "description" | "cta"
> & {
  title: BannerTextKey
  description?: BannerTextKey
  cta?: BannerTextKey
  priority: number
  enabled: boolean
  /** Live condition checked on top of `enabled`. */
  useCondition?: () => boolean
  /** Interpolation values for the texts, `undefined` until they are known. */
  useValues?: () => Record<string, unknown> | undefined
}

const bannerEntries: BannerConfig[] = [
  {
    id: "juicer",
    backgroundImage: "/images/juicer.webp",
    backgroundImageMobile: "/images/juicerMobile.webp",
    title: "banners.juicer.title",
    description: "banners.juicer.description",
    textColor: "#15171E",
    ctaColor: "#15171E",
    ctaTextColor: "#FFFFFF",
    cta: "banners.juicer.cta",
    to: LINKS.strategiesJuicer,
    priority: 0,
    enabled: true,
    useCondition: () => {
      const { featureFlags, isReady } = useRpcProvider()
      return isReady && featureFlags.juicerEnabled
    },
  },
  {
    id: "bil-vault",
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
  {
    id: "hollarb-24-11-26",
    backgroundImage: "/images/hollarb.webp",
    backgroundImageMobile: "/images/hollarbMobile.webp",
    title: "banners.hollarb.title",
    textColor: "#FFF",
    ctaColor: "#B3D7FA",
    ctaTextColor: "#0D1525",
    cta: "banners.hollarb.cta",
    to: LINKS.strategiesHollarBonds,
    priority: 2,
    enabled: false,
    useCondition: () => {
      const { featureFlags } = useRpcProvider()
      const hasFillableStableBondsOrders = useHasFillableStableBondsOrders()
      return featureFlags.hollarBondsEnabled && hasFillableStableBondsOrders
    },
    useValues: () => {
      const { active } = useStableBonds()
      const bondId = active?.id ?? ""
      const { timeLeft } = useBondData(bondId)
      const apr = getBondApr(bondId, timeLeft)
      return apr ? { apr } : undefined
    },
  },
]

export const bannerConfig: BannerConfig[] = [...bannerEntries].sort(
  (a, b) => a.priority - b.priority,
)

const useImagesLoaded = (srcs: string[]) => {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  const key = srcs.join("|")

  useEffect(() => {
    if (!key) return
    for (const src of key.split("|")) {
      const image = new Image()
      image.src = src
      image.decode().then(
        () => setLoaded((prev) => ({ ...prev, [src]: true })),
        () => setLoaded((prev) => ({ ...prev, [src]: false })),
      )
    }
  }, [key])

  return loaded
}

export const useEnabledBanners = (): EnabledBanner[] => {
  const { t } = useTranslation("common")
  const { gte } = useBreakpoints()
  const isDesktop = gte("sm")

  // bannerConfig is static, so the banner hooks run in the same order on every render
  const candidates = bannerConfig.flatMap((banner) => {
    if (!banner.enabled) return []

    const isConditionMet = banner.useCondition?.() ?? true
    const values = banner.useValues ? banner.useValues() : {}
    if (!isConditionMet || !values) return []

    const image = isDesktop
      ? banner.backgroundImage
      : banner.backgroundImageMobile

    return [{ banner, values, image }]
  })

  const imagesLoaded = useImagesLoaded(candidates.map(({ image }) => image))

  // hold the whole stack until every image has loaded or failed
  if (candidates.some(({ image }) => imagesLoaded[image] === undefined)) {
    return []
  }

  return candidates
    .filter(({ image }) => imagesLoaded[image])
    .map(({ banner, values }) => ({
      ...banner,
      title: t(banner.title, values),
      description: banner.description && t(banner.description, values),
      cta: banner.cta && t(banner.cta, values),
    }))
}

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
  gigaNewsDeferred: boolean
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
  deferGigaNews: () => void
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
  gigaNewsDeferred: false,
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

  const closedGigaNewsIds = (
    p?.closedGigaNewsIds ?? defaultState.closedGigaNewsIds
  ).filter((id) => bannerConfig.some((banner) => banner.id === id))

  return {
    ...currentState,
    banners,
    closedGigaNewsIds,
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
      deferGigaNews: () => set({ gigaNewsDeferred: true }),
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
