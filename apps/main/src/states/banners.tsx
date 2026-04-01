import {
  PromoteBanner,
  type PromoteBannerItem,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect } from "react"
import { toast as bannerSonner } from "sonner"
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

const bannerConfig: Array<BannerConfig> = parseBannersMarkdown(bannersMarkdown)

type BannersState = {
  closedBannerIds: string[]
}

type BannersActions = {
  close: (id: string) => void
  openGigaNews: () => void
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
      openGigaNews: () =>
        set(() => {
          return {
            closedBannerIds: [],
          }
        }),
    }),
    {
      name: "promote-banners",
      version: 2,
    },
  ),
)

export const useBanners = () => {
  const closedBannerIds = useBannersStore((state) => state.closedBannerIds)
  const close = useBannersStore((state) => state.close)
  const navigate = useNavigate()

  const renderBanners = useCallback(() => {
    bannerConfig.forEach((banner) => {
      if (closedBannerIds.includes(banner.id)) return

      const onClose = () => {
        close(banner.id)
        banner.onClose?.()
        bannerSonner.dismiss(banner.id)
      }

      bannerSonner.custom(
        () => (
          <PromoteBanner
            item={{
              ...banner,
              onClose,
              ...(banner.to
                ? {
                    onCta: () => {
                      navigate({ to: banner.to })
                    },
                  }
                : {}),
            }}
          />
        ),
        {
          id: banner.id,
          duration: Infinity,
          position: "bottom-left",
          onDismiss: onClose,
        },
      )
    })
  }, [close, closedBannerIds, navigate])

  return { renderBanners }
}

export const useRenderBanners = () => {
  const { renderBanners } = useBanners()

  useEffect(() => {
    renderBanners()
  }, [renderBanners])
}
