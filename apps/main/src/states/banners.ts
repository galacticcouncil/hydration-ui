import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type BannerConfig = PromoteBannerItem & { to?: string; priority: number }

const bannerEntries: BannerConfig[] = [
  // {
  //   id: "prime",
  //   backgroundImage: "/images/Prime.webp",
  //   backgroundImageMobile: "/images/PrimeMobile.webp",
  //   title: "Borrow Hollar against yield-bearing Prime",
  //   description: "Start earning 7,5% base yield on real estate-backed assets.",
  //   textColor: "rgba(17, 17, 17, 0.85)",
  //   ctaColor: "rgb(137, 43, 238)",
  //   ctaTextColor: "#f4f1ff",
  //   cta: "Try Prime",
  //   to: "/borrow",
  //   priority: 3,
  // },
  // {
  //   id: "eurc",
  //   backgroundImage: "/images/eurc.webp",
  //   backgroundImageMobile: "/images/eurcMobile.webp",
  //   title: "Eurozone just hit Hydration",
  //   description:
  //     "Swap, supply and Borrow EURC now available and fully hydrated.",
  //   textColor: "rgba(236, 255, 251, 0.88)",
  //   ctaColor: "rgb(0, 0, 0)",
  //   ctaTextColor: "#ecfffb",
  //   cta: "Try EURC",
  //   to: "/borrow",
  //   priority: 2,
  // },
  // {
  //   id: "gigasol",
  //   backgroundImage: "/images/gigasol.webp",
  //   backgroundImageMobile: "/images/gigasolMobile.webp",
  //   title: "GIGApower your SOL",
  //   description:
  //     "Loop, farm rewards or borrow HOLLAR against your yield-bearing GIGASOL position.",
  //   textColor: "rgba(255, 255, 255, 0.82)",
  //   ctaColor: "#373c4b",
  //   ctaTextColor: "#ffffff",
  //   cta: "Try GIGASOL",
  //   to: "/borrow",
  //   priority: 4,
  // },
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
    to: "/borrow",
    priority: 1,
  },
]

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
