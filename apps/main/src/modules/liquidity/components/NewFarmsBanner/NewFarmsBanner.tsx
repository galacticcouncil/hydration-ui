import { BannerTop } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"
import { sub } from "date-fns"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { NEW_YIELD_FARMS_DAYS, useNewFarms } from "@/api/farms"
import { LINKS } from "@/config/navigation"
import { useAssets } from "@/providers/assetsProvider"
import { useBannersStore } from "@/states/banners"

export const NewFarmsBannerWrapper = () => {
  const banner = useBannersStore((state) => state.banners["new-farms"])

  if (
    banner.visible === false ||
    (banner.timestamp &&
      sub(Date.now(), { days: NEW_YIELD_FARMS_DAYS }).getTime() >
        banner.timestamp)
  ) {
    return null
  }
  return <NewFarmsBanner />
}

export const NewFarmsBanner = () => {
  const { t } = useTranslation("common")
  const navigate = useNavigate()
  const { getAsset } = useAssets()
  const setBannerVisible = useBannersStore((state) => state.setBannerVisible)
  const banner = useBannersStore((state) => state.banners["new-farms"])

  const { data: newFarms, isSuccess } = useNewFarms()

  useEffect(() => {
    if (isSuccess && newFarms.length > 0 && !banner.visible) {
      const timestamp = Date.now()

      setBannerVisible("new-farms", true, timestamp)
    }
  }, [newFarms, isSuccess, getAsset, banner.visible, setBannerVisible])

  if (!newFarms || newFarms.length === 0) return null

  const assetSymbols = isSuccess
    ? newFarms
        .map((assetId) => getAsset(assetId)?.symbol)
        .filter(Boolean)
        .join(" & ")
    : ""

  return (
    <BannerTop
      message={t("banners.newFarms.title", { assetSymbols })}
      actionLabel={t("banners.newFarms.cta")}
      onAction={() => navigate({ to: LINKS.liquidity })}
      onClose={() => setBannerVisible("new-farms", false)}
    />
  )
}
