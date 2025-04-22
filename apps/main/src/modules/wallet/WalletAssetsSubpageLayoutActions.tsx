import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

export const WalletAssetsSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()

  if (isMobile) {
    return null
  }

  return (
    <Flex gap={12}>
      <Button variant="accent" outline>
        {t("send")}
      </Button>
      <Button variant="emphasis" outline iconStart={Minus}>
        {t("withdraw")}
      </Button>
      <Button variant="emphasis" outline iconStart={Plus}>
        {t("deposit")}
      </Button>
    </Flex>
  )
}
