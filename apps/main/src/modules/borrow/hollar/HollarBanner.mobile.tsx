import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ArrowRightLong, Close } from "@galacticcouncil/ui/assets/icons"
import HollarCans from "@galacticcouncil/ui/assets/images/HollarCans.webp"
import { ButtonIcon, Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useBannersStore } from "@/states/banners"

import { SContainer, SContent, SText } from "./HollarBanner.styled"

type Props = {
  readonly reserve: ComputedReserveData | null | undefined
}

export const HollarBannerMobile: FC<Props> = ({ reserve }) => {
  const { t } = useTranslation()
  const setBannerVisible = useBannersStore((state) => state.setBannerVisible)
  const banner = useBannersStore((state) => state.banners["hollar-banner"])

  if (banner.visible === false) return null

  return (
    <SContainer>
      <SContent>
        <SText>
          <Link
            sx={{ textDecoration: "none" }}
            to="/borrow/markets/$address"
            disabled={!reserve}
            params={{ address: reserve?.underlyingAsset ?? "" }}
          >
            <Flex gap="s" align="center">
              <Text fs="p3" lh={1} fw={700} color="#242C23" font="primary">
                {t("hollar.banner.title.mobile")}
              </Text>
              {reserve && (
                <Icon component={ArrowRightLong} size="m" color="#030816" />
              )}
            </Flex>
          </Link>
          <Text color="#1B1E1B" fs="p5" lh={1.1}>
            {t("hollar.banner.description")}
          </Text>
        </SText>
      </SContent>
      <img
        sx={{ size: "3xl", mr: "base", mt: "-base", zIndex: 1 }}
        src={HollarCans}
      />
      <ButtonIcon
        sx={{
          position: "absolute",
          top: -5,
          right: -5,
          p: "s",
          zIndex: 1,
          background: getToken("icons.onSurface"),
        }}
        onClick={() => setBannerVisible("hollar-banner", false, Date.now())}
      >
        <Icon component={Close} size={12} color={getToken("text.high")} />
      </ButtonIcon>
    </SContainer>
  )
}
