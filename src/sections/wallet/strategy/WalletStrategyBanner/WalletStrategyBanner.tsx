import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FC } from "react"

import { Button } from "components/Button/Button"
import { Link } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import {
  SCansImage,
  SWalletStrategyBanner,
} from "./WalletStrategyBanner.styled"
import GigadotTitle from "./assets/gigadot-title.svg?react"
import cansImageSrc from "./assets/cans.webp"

export const WalletStrategyBanner: FC = () => {
  const { t } = useTranslation()

  return (
    <SWalletStrategyBanner>
      <SCansImage src={cansImageSrc} alt="Hydration" />
      <div sx={{ flex: "column", gap: 6 }} css={{ flex: 1 }}>
        <GigadotTitle
          sx={{ color: "white" }}
          aria-label={t("wallet.strategy.banner.title")}
        />
        <Text fw={400} fs={13} lh="1.3" color="white">
          {t("wallet.strategy.banner.description")}
        </Text>
      </div>
      <Button
        size="small"
        sx={{ width: ["100%", 120], ml: "auto" }}
        as={(props) => <Link to={LINKS.gigadotStrategies} {...props} />}
      >
        {t("wallet.strategy.banner.cta")}
      </Button>
    </SWalletStrategyBanner>
  )
}
