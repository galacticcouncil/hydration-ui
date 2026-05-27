import { Close, Flame } from "@galacticcouncil/ui/assets/icons"
import { Icon, MorphLabel, PromoteBanner } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  SGigaNewsContainer,
  SGigaNewsToggleButton,
  SStackLayer,
  SStackRoot,
} from "@/components/GigaNews/GigaNews.styled"
import { bannerConfig, useBannersStore } from "@/states/banners"

export const GigaNews = ({ isHidden }: { isHidden: boolean }) => {
  const { t } = useTranslation("common")
  const [isCloseAll, setCloseAll] = useState(false)

  const { openAllGigaNews, closeAllGigaNews, closedGigaNewsIds } =
    useBannersStore()

  const allClosed = closedGigaNewsIds.length === bannerConfig.length
  const [expanded, setExpanded] = useState(allClosed ? false : true)
  const toggleLabel = expanded
    ? bannerConfig.length > 1
      ? t("closeAll")
      : t("close")
    : t("gigaNews")

  const close = useBannersStore((state) => state.closeGigaNews)
  const navigate = useNavigate()

  const visibleBanners = bannerConfig.filter(
    (banner) => !closedGigaNewsIds.includes(banner.id),
  )

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

  if (!bannerConfig.length) return <div />

  return (
    <SGigaNewsContainer $hidden={isHidden && allClosed}>
      {visibleBanners.length > 0 && (
        <SStackRoot $closing={isCloseAll}>
          {visibleBanners.map((banner, depth) => {
            const onClose = () => {
              close(banner.id)
              banner.onClose?.()
            }

            return (
              <SStackLayer key={banner.id} $depth={depth}>
                <PromoteBanner
                  item={{
                    ...banner,
                    onClose: depth === 0 ? onClose : undefined,
                    ...(banner.to
                      ? {
                          onCta: () => {
                            navigate({ to: banner.to })
                          },
                        }
                      : {}),
                  }}
                />
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
        onClick={allClosed ? onOpenAll : onCloseAll}
      >
        <Icon size={expanded ? 14 : 16} component={expanded ? Close : Flame} />
        <MorphLabel text={toggleLabel} />
      </SGigaNewsToggleButton>
    </SGigaNewsContainer>
  )
}
