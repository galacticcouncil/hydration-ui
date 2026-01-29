import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ArrowRightLong } from "@galacticcouncil/ui/assets/icons"
import HollarCans from "@galacticcouncil/ui/assets/images/HollarCans.webp"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SContainer, SContent, SText } from "./HollarBanner.styled"

type Props = {
  readonly reserve: ComputedReserveData | null | undefined
}

export const HollarBannerMobile: FC<Props> = ({ reserve }) => {
  const { t } = useTranslation()

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
    </SContainer>
  )
}
