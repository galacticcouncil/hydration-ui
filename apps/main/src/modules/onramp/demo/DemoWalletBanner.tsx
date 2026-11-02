import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { DEMO_WALLET_ENABLED } from "./demoWallet.config"

export const DemoWalletBanner = () => {
  const { t } = useTranslation("onramp")
  if (!DEMO_WALLET_ENABLED) return null
  return (
    <Flex
      role="status"
      align="center"
      justify="space-between"
      gap="m"
      px="l"
      py="s"
      bg={getToken("surfaces.containers.dim.dimOnHigh")}
    >
      <Text fs="p5">{t("demoWallet.banner")}</Text>
      <Button
        size="small"
        variant="tertiary"
        onClick={() => {
          sessionStorage.removeItem("ramp-demo-wallet")
          const url = new URL(window.location.href)
          url.searchParams.delete("demoWallet")
          window.location.assign(url)
        }}
      >
        {t("demoWallet.exit")}
      </Button>
    </Flex>
  )
}
