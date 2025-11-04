import {
  Chip,
  Flex,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"

import { SYieldOpportunityContainer } from "./AvailableFarm.styled"

export const SupplyYieldOpportunity = ({
  borrowApyData,
}: {
  borrowApyData: BorrowAssetApyData
}) => {
  const { t } = useTranslation(["common", "liquidity"])

  const value = borrowApyData.underlyingSupplyApy

  return (
    <SYieldOpportunityContainer as={Paper} direction="column" gap={10}>
      <Flex align="center" gap={10}>
        <Text color={getToken("text.high")} fs="p2" fw={600}>
          {t("apy")}
        </Text>
        <Chip variant="green" size="small">
          {t("percent", {
            value,
          })}
        </Chip>
      </Flex>
      <Separator />
      <Text fs="p5" color={getToken("text.medium")} fw={400}>
        {t("liquidity:liquidity.supplyYieldOpportunity.apy.description")}
      </Text>
    </SYieldOpportunityContainer>
  )
}
