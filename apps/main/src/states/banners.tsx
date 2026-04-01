import {
  PromoteBanner,
  type PromoteBannerItem,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect } from "react"
import { toast as bannerSonner } from "sonner"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import PrimeImage from "@/assets/images/Prime.webp"
import PrimeImageMobile from "@/assets/images/PrimeMobile.webp"
import { LINKS } from "@/config/navigation"
import i18n from "@/i18n"

const bannerConfig: Array<PromoteBannerItem & { to: string }> = [
  {
    id: "prime",
    backgroundImage: PrimeImage,
    backgroundImageMobile: PrimeImageMobile,
    title: i18n.t("banner.prime.title"),
    description: i18n.t("banner.prime.description"), //@TODO: could be taken from real data
    cta: i18n.t("banner.prime.cta"),
    to: LINKS.borrowDashboard,
  },
]

type BannersState = {
  closedBannerIds: string[]
}

type BannersActions = {
  close: (id: string) => void
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
    }),
    {
      name: "promote-banners",
      version: 1,
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
              onCta: () => {
                navigate({ to: banner.to })
              },
              onClose,
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
