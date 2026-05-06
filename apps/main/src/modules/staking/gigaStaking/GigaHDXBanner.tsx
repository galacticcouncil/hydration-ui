import { Close } from "@galacticcouncil/ui/assets/icons"
import gigaHDXBannerCans from "@galacticcouncil/ui/assets/images/GigaHDXCans.webp"
import {
  Box,
  Button,
  ButtonIcon,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SGigaHDXBanner } from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { useBannersStore } from "@/states/banners"

export const GigaHDXBanner: FC = () => {
  const { t } = useTranslation("staking")
  const setBannerVisible = useBannersStore((state) => state.setBannerVisible)
  const banner = useBannersStore((state) => state.banners["giga-stake"])

  if (banner.visible === false) return null

  return (
    <SGigaHDXBanner direction={["row-reverse", "row-reverse", "row"]}>
      <img
        sx={{
          mt: "-m",
          ml: "l",
          zIndex: 1,
        }}
        src={gigaHDXBannerCans}
      />

      <Flex
        align="center"
        justify="space-between"
        gap="l"
        width="100%"
        p="xl"
        sx={{ zIndex: 1 }}
      >
        <Box>
          <Text
            font="primary"
            fw={600}
            color={getToken("text.high")}
            fs={["p3", "p3", "p2"]}
          >
            {t("gigaStaking.banner.title")}
          </Text>
          <Text fs={["p5", "p5", "p4"]} lh="m" color={getToken("text.high")}>
            {t("gigaStaking.banner.description")}
          </Text>
        </Box>

        <Button size="medium" sx={{ display: ["none", "none", "block"] }}>
          {t("gigaStaking.banner.cta")}
        </Button>
      </Flex>

      <ButtonIcon
        sx={{
          position: "absolute",
          top: -5,
          right: -5,
          p: "s",
          zIndex: 1,
          background: getToken("icons.onSurface"),
        }}
      >
        <Icon
          component={Close}
          size={12}
          color={getToken("text.high")}
          onClick={() => setBannerVisible("giga-stake", false, Date.now())}
        />
      </ButtonIcon>
    </SGigaHDXBanner>
  )
}
