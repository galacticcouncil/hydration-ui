import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ArrowRightLong } from "@galacticcouncil/ui/assets/icons"
import HollarCans from "@galacticcouncil/ui/assets/images/HollarCans.webp"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { px } from "@galacticcouncil/ui/utils"
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
            <Flex gap={4}>
              <Text fs={14} lh={px(15)} fw={700} color="#242C23" font="primary">
                {t("hollar.banner.title.mobile")}
              </Text>
              {reserve && (
                <Icon component={ArrowRightLong} size={18} color="#030816" />
              )}
            </Flex>
          </Link>
          <Text color="#1B1E1B" fs={12} lh={px(15)}>
            {t("hollar.banner.description")}
          </Text>
        </SText>
      </SContent>
      <img
        sx={{ mr: 8, mt: -6, zIndex: 10 }}
        src={HollarCans}
        width={92}
        height={93}
      />
    </SContainer>
  )
}
