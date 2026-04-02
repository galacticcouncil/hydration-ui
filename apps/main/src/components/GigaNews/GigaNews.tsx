import { Close, Flame } from "@galacticcouncil/ui/assets/icons"
import { Icon, MorphLabel, PromoteBanner } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  SGigaNewsContainer,
  SGigaNewsToggleButton,
  SStackEnter,
  SStackLayer,
  SStackRoot,
} from "@/components/GigaNews/GigaNews.styled"
import { bannerConfig, useBannersStore } from "@/states/banners"

export const GigaNews = ({ isHidden }: { isHidden: boolean }) => {
  const { t } = useTranslation("common")
  const [isCloseAll, setCloseAll] = useState(false)

  const { openAll, closeAll, closedBannerIds } = useBannersStore()

  const allClosed = closedBannerIds.length === bannerConfig.length
  const [expanded, setExpanded] = useState(allClosed ? false : true)
  const toggleLabel = expanded ? t("closeAll") : t("gigaNews")

  const close = useBannersStore((state) => state.close)
  const navigate = useNavigate()

  const visibleBanners = bannerConfig.filter(
    (banner) => !closedBannerIds.includes(banner.id),
  )

  const onCloseRef = useRef(closeAll)
  onCloseRef.current = closeAll

  const onCloseAll = useCallback(() => {
    if (!onCloseRef.current || isCloseAll) return
    setCloseAll(true)
    setExpanded(false)
  }, [isCloseAll, setExpanded])

  const onOpenAll = useCallback(() => {
    setExpanded(true)
    openAll()
  }, [openAll, setExpanded])

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

  return (
    <SGigaNewsContainer $hidden={isHidden && allClosed}>
      {visibleBanners.length > 0 && (
        <SStackRoot>
          {visibleBanners.map((banner, depth) => {
            const onClose = () => {
              close(banner.id)
              banner.onClose?.()
            }

            return (
              <SStackLayer key={banner.id} $depth={depth}>
                <SStackEnter $depth={depth} $closing={isCloseAll}>
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
                </SStackEnter>
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
