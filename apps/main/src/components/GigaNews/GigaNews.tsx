import { Flame } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Icon,
  PromoteBanner,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  SStackEnter,
  SStackLayer,
  SStackRoot,
} from "@/components/GigaNews/GigaNews.styled"
import { bannerConfig, useBannersStore } from "@/states/banners"

export const GigaNews = () => {
  const { t } = useTranslation("common")
  const [isCloseAll, setCloseAll] = useState(false)
  const { openAll, closeAll, closedBannerIds } = useBannersStore()

  const allClosed = closedBannerIds.length === bannerConfig.length

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
  }, [isCloseAll])

  useEffect(() => {
    if (!isCloseAll) return
    const id = setTimeout(() => {
      onCloseRef.current?.()
      setCloseAll(false)
    }, 280)
    return () => clearTimeout(id)
  }, [isCloseAll])

  return (
    <Box>
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
      <Button
        variant="tertiary"
        outline
        size="small"
        onClick={allClosed ? openAll : onCloseAll}
        sx={{ color: getToken("text.high"), textTransform: "uppercase" }}
      >
        <Icon size={18} component={Flame} />
        {allClosed ? t("gigaNews") : t("closeAll")}
      </Button>
    </Box>
  )
}
