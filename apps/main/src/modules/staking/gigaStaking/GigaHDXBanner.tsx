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
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { SGigaHDXBanner } from "@/modules/staking/gigaStaking/GigaStaking.styled"
import { useGigaStakingMigration } from "@/modules/staking/gigaStaking/GigaStakingMigration.utils"
import { MigrateConfirmationModal } from "@/modules/staking/gigaStaking/MigrateConfirmationModal"
import { useBannersStore } from "@/states/banners"

export type GigaHDXBannerProps = {
  stakeAmount: bigint
  type: "stake" | "migration"
}

export const GigaHDXBanner: FC<GigaHDXBannerProps> = ({
  stakeAmount,
  type,
}) => {
  const [isMigrateConfirmationModalOpen, setIsMigrateConfirmationModalOpen] =
    useState(false)
  const { t } = useTranslation("staking")
  const setBannerVisible = useBannersStore((state) => state.setBannerVisible)
  const banner = useBannersStore(
    (state) =>
      state.banners[type === "stake" ? "giga-stake" : "giga-migration"],
  )

  const mutation = useGigaStakingMigration()

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
            {type === "stake"
              ? t("gigaStaking.banner.description.stake")
              : t("gigaStaking.banner.description.migrate")}
          </Text>
        </Box>

        {type === "stake" ? (
          <Button
            size="medium"
            sx={{ display: ["none", "none", "block"] }}
            asChild
          >
            <Link to={LINKS.stakingGigaStake}>
              {t("gigaStaking.banner.cta.stake")}
            </Link>
          </Button>
        ) : (
          <Button
            size="medium"
            sx={{ display: ["none", "none", "block"] }}
            onClick={() => setIsMigrateConfirmationModalOpen(true)}
          >
            {t("gigaStaking.banner.cta.migrate")}
          </Button>
        )}
        <MigrateConfirmationModal
          open={isMigrateConfirmationModalOpen}
          onClose={() => setIsMigrateConfirmationModalOpen(false)}
          onConfirm={() => mutation.mutate(stakeAmount.toString())}
        />
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
          onClick={() =>
            setBannerVisible(
              type === "stake" ? "giga-stake" : "giga-migration",
              false,
              Date.now(),
            )
          }
        />
      </ButtonIcon>
    </SGigaHDXBanner>
  )
}
