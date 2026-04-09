import {
  Box,
  Button,
  ButtonIcon,
  Flex,
  Icon,
  ModalBody,
  ModalCloseTrigger,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { bigShift } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { AssetLogo } from "@/components/AssetLogo/AssetLogo"
import { getCexConfigById } from "@/modules/onramp/config/cex"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { DepositConfig, OnrampScreen } from "@/modules/onramp/types"
import { useAssets } from "@/providers/assetsProvider"

export const PendingDeposit: React.FC<DepositConfig> = ({
  id,
  cexId,
  asset,
  amount,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { getAsset } = useAssets()
  const { setAsset, paginateTo, setAmount, setFinishedDeposit } =
    useOnrampStore(
      useShallow(
        pick(["setAsset", "paginateTo", "setAmount", "setFinishedDeposit"]),
      ),
    )

  const assetMeta = getAsset(asset.assetId)
  const cex = getCexConfigById(cexId)

  if (!assetMeta || !cex) return null

  const handleContinue = () => {
    setAsset(asset)
    paginateTo(OnrampScreen.DepositTransfer)
    setAmount(amount)
  }

  const handleDelete = () => {
    setFinishedDeposit(id)
  }

  const depositChain = chainsMap.get(asset.depositChain)

  return (
    <Box>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="m">
          <Flex justify="center" align="center" gap="xs">
            <Icon component={cex.logo} size="xl" />
            <AssetLogo id={asset.assetId} size="medium" />
          </Flex>
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
        <Flex align="center" gap="base">
          <Button size="small" variant="secondary" onClick={handleContinue}>
            {t("deposit.cex.transfer.finish")}
          </Button>
          <ModalRoot>
            <ModalTrigger asChild>
              <ButtonIcon size="small" variant="danger" outline>
                <Icon component={Trash2} size="s" />
              </ButtonIcon>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader
                title={t("deposit.cex.transfer.delete.title")}
                align="center"
              />
              <ModalBody scrollable={false}>
                <Text fs="p4" align="center" mb="m">
                  {t("deposit.cex.transfer.delete.description", {
                    symbol: assetMeta.symbol,
                    amount: bigShift(amount, -assetMeta.decimals),
                    cex: cex.title,
                  })}
                </Text>
                {depositChain && (
                  <Text fs="p4" align="center">
                    {t("deposit.cex.transfer.delete.affirmation", {
                      chainName: depositChain.name,
                    })}
                  </Text>
                )}
              </ModalBody>
              <ModalFooter justify="space-between">
                <ModalCloseTrigger asChild>
                  <Button size="medium" variant="tertiary">
                    {t("common:cancel")}
                  </Button>
                </ModalCloseTrigger>
                <Button size="medium" variant="danger" onClick={handleDelete}>
                  {t("deposit.cex.transfer.delete.confirm")}
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalRoot>
        </Flex>
      </Flex>
    </Box>
  )
}
