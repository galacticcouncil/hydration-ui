import { ModalBody, ModalHeader, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import { useAssets } from "@/providers/assetsProvider"

import { FarmDetails } from "./FarmDetails"

type AvailableFarmModalBodyProps = {
  farm: Farm | null
}

export const AvailableFarmModalBody = ({
  farm,
}: AvailableFarmModalBodyProps) => {
  const { t } = useTranslation("liquidity")
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(farm?.rewardCurrency ?? "")

  if (!farm) return null

  return (
    <>
      <ModalHeader
        title={t("liquidity.availableFarms.modal.title", {
          symbol: meta?.symbol,
        })}
      />
      <ModalBody>
        <FarmDetails farm={farm} />

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
