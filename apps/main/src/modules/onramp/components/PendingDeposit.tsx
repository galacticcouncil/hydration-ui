import {
  Box,
  Button,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { AssetLogo } from "@/components/AssetLogo/AssetLogo"
import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { DepositConfig, OnrampScreen } from "@/modules/onramp/types"
import { useAssets } from "@/providers/assetsProvider"
import { toBig } from "@/utils/formatting"

export const PendingDeposit: React.FC<DepositConfig> = ({ asset, amount }) => {
  const { t } = useTranslation(["onramp"])
  const { getAsset } = useAssets()
  const { setAsset, paginateTo, setAmount } = useDepositStore(
    useShallow(pick(["setAsset", "paginateTo", "setAmount"])),
  )

  const assetDetails = getAsset(asset.assetId)

  if (!assetDetails) return null

  const handleContinue = () => {
    setAsset(asset)
    paginateTo(OnrampScreen.DepositTransfer)
    setAmount(amount)
  }

  return (
    <Box>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={12}>
          <Icon size={24} component={Spinner} />
          <AssetLogo id={asset.assetId} />
          <Stack>
            <Text fs={14} fw={600}>
              {t("deposit.cex.transfer.ongoing.status")}
            </Text>
            <Text fs={12} color={getToken("text.low")}>
              {toBig(amount, assetDetails.decimals).toString()}{" "}
              {assetDetails.symbol}
            </Text>
          </Stack>
        </Flex>
        <Button size="small" variant="primary" onClick={handleContinue}>
          {t("deposit.cex.transfer.finish")}
        </Button>
      </Flex>
    </Box>
  )
}
