import { Close, Flame } from "@galacticcouncil/ui/assets/icons"
import {
  Icon,
  MorphLabel,
  PromoteBanner,
  PromoteBannerProps,
} from "@galacticcouncil/ui/components"
import { HOLLAR_BOND_25_08_26_ID } from "@galacticcouncil/utils"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import {
  SGigaNewsContainer,
  SGigaNewsToggleButton,
  SStackLayer,
  SStackRoot,
} from "@/components/GigaNews/GigaNews.styled"
import { getBondApr } from "@/modules/strategies/stable-bonds/utils/apr"
import { useBannersStore, useEnabledBanners } from "@/states/banners"

const HollarBondBanner: React.FC<PromoteBannerProps> = ({ item }) => {
  const { t } = useTranslation("common")
  const { timeLeft } = useBondData(HOLLAR_BOND_25_08_26_ID)
  const apr = getBondApr(HOLLAR_BOND_25_08_26_ID, timeLeft)
  return (
    <PromoteBanner
      item={{
        ...item,
        title: t("banners.hollarb.title"),
        description: apr ? t("banners.hollarb.description", { apr }) : "",
      }}
    />
  )
}

export const GigaNews = ({ isHidden }: { isHidden: boolean }) => {
  const { t } = useTranslation("common")
  const [isCloseAll, setCloseAll] = useState(false)

  const { openAllGigaNews, closeAllGigaNews, closedGigaNewsIds } =
    useBannersStore()
  const enabledBanners = useEnabledBanners()

  const allClosed = closedGigaNewsIds.length === enabledBanners.length
  const [expanded, setExpanded] = useState(allClosed ? false : true)
  const toggleLabel = expanded
    ? enabledBanners.length > 1
      ? t("closeAll")
      : t("close")
    : t("gigaNews")

  const close = useBannersStore((state) => state.closeGigaNews)
  const navigate = useNavigate()

  const visibleBanners = enabledBanners.filter(
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

  if (!enabledBanners.length) return null

  return (
    <SGigaNewsContainer isHidden={isHidden && allClosed}>
      {visibleBanners.length > 0 && (
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
                {banner.id === "hollarb" ? (
                  <HollarBondBanner item={item} />
                ) : (
                  <PromoteBanner item={item} />
                )}
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
