import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { SClaimCard } from "./ClaimCard.styled"

export const ClaimCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation(["liquidity", "common"])

  return (
    <SClaimCard sx={{ maxWidth: ["100%", "100%", 454] }} className={className}>
      <Flex direction="column" gap={1}>
        <Text fs="p6" fw={400} color={getToken("text.high")} sx={{ mb: 4 }}>
          {t("liquidity.claimCard.totalClaimableValue")}
        </Text>
        <Text
          fs="h7"
          fw={700}
          font="primary"
          color={getToken("accents.success.emphasis")}
          lh={1}
        >
          {t("common:currency", { value: 130100, prefix: "+" })}
        </Text>
        <Text fs="p6" fw={400} color={getToken("text.medium")} lh={1}>
          1000 HDX + 124 LRNA + 12.24 DOT
        </Text>
      </Flex>
      <Button variant="success">{t("liquidity.claimCard.claim")}</Button>
    </SClaimCard>
  )
}
