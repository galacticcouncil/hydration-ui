import { type PromoteBannerItem } from "@galacticcouncil/ui/components"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import bannersMarkdown from "@/banners.md?raw"

type BannerConfig = PromoteBannerItem & { to?: string }

const parseBannersMarkdown = (markdown: string): Array<BannerConfig> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(markdown)
  } catch {
    throw new Error("Invalid banners markdown: expected a JSON array")
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid banners markdown: expected an array")
  }

  return parsed.map((item) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("Invalid banners markdown: each banner must be an object")
    }

    const values = item as Record<string, unknown>

    const getRequiredValue = (key: string): string => {
      const value = values[key]
      if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Invalid banners markdown: missing "${key}"`)
      }
      return value
    }
    const getOptionalValue = (key: string): string => {
      const value = values[key]
      return typeof value === "string" ? value : ""
    }

    return {
      id: getRequiredValue("id"),
      backgroundImage: getRequiredValue("backgroundImage"),
      backgroundImageMobile: getRequiredValue("backgroundImageMobile"),
      title: getRequiredValue("title"),
      description: getRequiredValue("description"),
      textColor: getOptionalValue("textColor"),
      ctaColor: getOptionalValue("ctaColor"),
      ctaTextColor: getOptionalValue("ctaTextColor"),
      cta: getOptionalValue("cta"),
      to: getOptionalValue("to"),
    }
  })
}

export const bannerConfig: Array<BannerConfig> =
  parseBannersMarkdown(bannersMarkdown)

type BannersState = {
  closedBannerIds: string[]
}

type BannersActions = {
  close: (id: string) => void
  openAll: () => void
  closeAll: () => void
}

type BannersStore = BannersState & BannersActions

const defaultState: BannersState = {
  closedBannerIds: [],
}

export const useBannersStore = create<BannersStore>()(
  persist(
    (set) => ({
      ...defaultState,
      close: (id) =>
        set((state) => {
          if (state.closedBannerIds.includes(id)) return state

          return {
            closedBannerIds: [...state.closedBannerIds, id],
          }
        }),
      openAll: () =>
        set(() => {
          return {
            closedBannerIds: [],
          }
        }),
      closeAll: () =>
        set(() => {
          return {
            closedBannerIds: bannerConfig.map((banner) => banner.id),
          }
        }),
    }),
    {
      name: "promote-banners",
      version: 2,
    },
  ),
)
