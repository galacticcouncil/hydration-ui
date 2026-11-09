import { Close, Flame } from "@galacticcouncil/ui/assets/icons"
import { Icon, MorphLabel, PromoteBanner } from "@galacticcouncil/ui/components"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  SGigaNewsContainer,
  SGigaNewsToggleButton,
  SStackLayer,
  SStackRoot,
} from "@/components/GigaNews/GigaNews.styled"
import { gigaNewsToggleAction } from "@/components/GigaNews/GigaNews.utils"
import { useIsOverlayOpen } from "@/hooks/useIsOverlayOpen"
import {
  bannerConfig,
  useBannersStore,
  useEnabledBanners,
} from "@/states/banners"

export const GigaNews = ({ isHidden }: { isHidden: boolean }) => {
  const { t } = useTranslation("common")
  const [isCloseAll, setCloseAll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isOverlayOpen = useIsOverlayOpen({ ignoreRef: containerRef })

  const {
    openAllGigaNews,
    closeAllGigaNews,
    closedGigaNewsIds,
    gigaNewsDeferred,
  } = useBannersStore()
  const enabledBanners = useEnabledBanners()

  const close = useBannersStore((state) => state.closeGigaNews)
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })

  // visiting a banner's target page counts as seeing the news
  useEffect(() => {
    bannerConfig
      .filter((banner) => banner.to && pathname.startsWith(banner.to))
      .forEach((banner) => close(banner.id))
  }, [pathname, close])

  const visibleBanners = enabledBanners.filter(
    (banner) => !closedGigaNewsIds.includes(banner.id),
  )

  const allClosed =
    enabledBanners.length > 0 &&
    enabledBanners.every((b) => closedGigaNewsIds.includes(b.id))
  const [expanded, setExpanded] = useState(!allClosed && !gigaNewsDeferred)

  const toggleLabel = expanded
    ? enabledBanners.length > 1
      ? t("closeAll")
      : t("close")
    : t("gigaNews")

  const onCloseRef = useRef(closeAllGigaNews)
  onCloseRef.current = closeAllGigaNews

  const onCloseAll = useCallback(() => {
    if (!onCloseRef.current || isCloseAll) return
    setCloseAll(true)
    setExpanded(false)
  }, [isCloseAll, setExpanded])

  const onOpenAll = useCallback(() => {
    setExpanded(true)
    openAllGigaNews()
  }, [openAllGigaNews, setExpanded])

  const onToggle = useCallback(() => {
    const action = gigaNewsToggleAction(expanded, allClosed)
    if (action === "collapse") return onCloseAll()
    if (action === "restore") return onOpenAll()
    setExpanded(true)
  }, [allClosed, expanded, onCloseAll, onOpenAll])

  useEffect(() => {
    if (!isCloseAll) return
    const id = setTimeout(() => {
      onCloseRef.current?.()
      setCloseAll(false)
    }, 280)
    return () => clearTimeout(id)
  }, [isCloseAll])

  useEffect(() => {
    if (allClosed && expanded) {
      setExpanded(false)
    }
  }, [allClosed, expanded, setExpanded])

  useEffect(() => {
    if (gigaNewsDeferred) setExpanded(false)
  }, [gigaNewsDeferred])

  if (!enabledBanners.length || isOverlayOpen) return null

  const stackVisible = expanded || isCloseAll

  return (
    <SGigaNewsContainer ref={containerRef} isHidden={isHidden && !stackVisible}>
      {stackVisible && visibleBanners.length > 0 && (
        <SStackRoot $closing={isCloseAll}>
          {visibleBanners.map((banner, depth) => {
            const onClose = () => {
              close(banner.id)
              banner.onClose?.()
            }

            const item = {
              ...banner,
              onClose: depth === 0 ? onClose : undefined,
              ...(banner.to
                ? {
                    onCta: () => {
                      navigate({ to: banner.to })
                    },
                  }
                : {}),
            }

            return (
              <SStackLayer key={banner.id} $depth={depth}>
                <PromoteBanner item={item} />
              </SStackLayer>
            )
          })}
        </SStackRoot>
      )}
      <SGigaNewsToggleButton
        variant="tertiary"
        size="small"
        outline
        blur
        onClick={onToggle}
      >
        <Icon size={expanded ? 14 : 16} component={expanded ? Close : Flame} />
        <MorphLabel text={toggleLabel} />
      </SGigaNewsToggleButton>
    </SGigaNewsContainer>
  )
}
