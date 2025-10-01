import { ModalBody, ModalHeader, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { LoyaltyGraph } from "@/modules/liquidity/components/Farms/LoyaltyGraph"
import { useAssets } from "@/providers/assetsProvider"

import { AvailableFarm } from "./AvailableFarm"

type AvailableFarmModalBodyProps = {
  farm: Farm | null
}

export const AvailableFarmModalBody = ({
  farm,
}: AvailableFarmModalBodyProps) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(farm?.rewardCurrency ?? "")

  return (
    <>
      <ModalHeader
        title={t("liquidity.availableFarms.modal.title", {
          symbol: meta?.symbol,
        })}
      />
      <ModalBody>
        {farm && (
          <AvailableFarm
            farm={farm}
            sx={{ pb: getTokenPx("containers.paddings.secondary") }}
          />
        )}

        {farm?.loyaltyCurve && <LoyaltyGraph farm={farm} />}

        <Text
          fs="p2"
          color={getToken("text.tint.primary")}
          sx={{
            textAlign: "center",
            py: getTokenPx("containers.paddings.secondary"),
          }}
        >
          {t("liquidity.availableFarms.modal.graph.description")}
        </Text>
      </ModalBody>
    </>
  )
}
