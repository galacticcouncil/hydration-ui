import { Settings } from "@galacticcouncil/ui/assets/icons"
import { Button, Text } from "@galacticcouncil/ui/components"
import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components"

// TODO delete if not used in design again
export const WalletAssetsSettings = () => {
  const { t } = useTranslation("wallet")

  return (
    <Flex gap={8.5} align="center">
      <Text fs="p4" fw={500} color={getToken("text.medium")}>
        {t("feePaymentAssets")}
      </Text>
      <Flex gap={4} align="center">
        <Logo id="0" size="small" />
        <Text fs="p3" fw={500} color={getToken("text.high")}>
          HDX
        </Text>
      </Flex>
      <Button variant="tertiary" outline size="medium" iconStart={Settings} />
    </Flex>
  )
}
