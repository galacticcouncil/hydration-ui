import {
  Chip,
  Flex,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { BorrowAssetApyData } from "@/api/borrow"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"

import { SYieldOpportunityContainer } from "./AvailableFarm.styled"

export const SupplyYieldOpportunity = ({
  borrowApyData,
  omnipoolFee,
  stablepoolFee,
}: {
  borrowApyData: BorrowAssetApyData
  omnipoolFee?: string
  stablepoolFee?: string
}) => {
  const { t } = useTranslation(["common", "liquidity"])

  const value = Big(borrowApyData.underlyingSupplyApy)
    .plus(omnipoolFee ?? 0)
    .plus(stablepoolFee ?? 0)
    .toString()

  return (
    <SYieldOpportunityContainer
      as={Paper}
      direction="column"
      gap={10}
      sx={{
        p: getTokenPx([
          "containers.paddings.secondary",
          "containers.paddings.primary",
        ]),
      }}
    >
      <Flex align="center" gap={10}>
        <Text color={getToken("text.high")} fs="p2" fw={600}>
          {t("apy")}
        </Text>
        <Chip variant="green" size="small">
          <Flex align="center" gap={4}></Flex>
          {t("percent", {
            value,
          })}

          <TooltipAPR
            borrowApyData={{ ...borrowApyData, incentives: [] }}
            omnipoolFee={omnipoolFee}
            stablepoolFee={stablepoolFee}
            farms={[]}
            iconColor={getToken("accents.success.emphasis")}
          />
        </Chip>
      </Flex>
      <Separator />
      <Text fs="p5" color={getToken("text.medium")} fw={400}>
        {t("liquidity:liquidity.supplyYieldOpportunity.apy.description")}
      </Text>
    </SYieldOpportunityContainer>
  )
}
