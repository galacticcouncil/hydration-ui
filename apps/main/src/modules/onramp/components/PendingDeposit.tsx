import { Box, Button, Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { bigShift } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { AssetLogo } from "@/components/AssetLogo/AssetLogo"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { DepositConfig, OnrampScreen } from "@/modules/onramp/types"
import { useAssets } from "@/providers/assetsProvider"

export const PendingDeposit: React.FC<DepositConfig> = ({ asset, amount }) => {
  const { t } = useTranslation(["onramp", "common"])
  const { getAsset } = useAssets()
  const { setAsset, paginateTo, setAmount } = useOnrampStore(
    useShallow(pick(["setAsset", "paginateTo", "setAmount"])),
  )

  const assetMeta = getAsset(asset.assetId)

  if (!assetMeta) return null

  const handleContinue = () => {
    setAsset(asset)
    paginateTo(OnrampScreen.DepositTransfer)
    setAmount(amount)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="m">
          <AssetLogo id={asset.assetId} />
          <Stack>
            <Text fs="p5" lh={1} fw={600}>
              {assetMeta.symbol}
            </Text>
            <Text fs="p5" color={getToken("text.low")}>
              {t("common:currency", {
                value: bigShift(amount, -assetMeta.decimals).toString(),
                symbol: assetMeta.symbol,
              })}
            </Text>
          </Stack>
        </Flex>
        <Button size="small" variant="secondary" onClick={handleContinue}>
          {t("deposit.cex.transfer.finish")}
        </Button>
      </Flex>
    </Box>
  )
}
