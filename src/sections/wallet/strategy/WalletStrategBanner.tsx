import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FC } from "react"
import { SWalletStrategBanner } from "sections/wallet/strategy/WalletStrategBanner.styled"
import { Button } from "components/Button/Button"
import GigaDOTCan from "assets/icons/GigaDOTCan.svg?react"
import { Link } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

export const WalletStrategyBanner: FC = () => {
  const { t } = useTranslation()

  return (
    <SWalletStrategBanner>
      <div sx={{ flex: "row", gap: 30, align: "center" }}>
        <GigaDOTCan />
        <div sx={{ flex: "column", gap: 6 }}>
          <Text fw={700} fs={16} lh="1.3" color="white">
            {t("wallet.strategy.banner.title")}
          </Text>
          <Text fw={400} fs={13} lh="1.3" color="white">
            {t("wallet.strategy.banner.description")}
          </Text>
        </div>
      </div>
      <Link to={LINKS.walletStrategy}>
        <Button transform="uppercase" size="small">
          {t("wallet.strategy.banner.cta")}
        </Button>
      </Link>
    </SWalletStrategBanner>
  )
}
