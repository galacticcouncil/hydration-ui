import { Settings } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useAccountFeePaymentAssets } from "@/api/payments"
import { Logo } from "@/components/Logo"
import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"

export const MyAssetsFeePaymentChange = () => {
  const { t } = useTranslation("wallet")

  const { accountFeePaymentAsset, isLoading } = useAccountFeePaymentAssets()

  return (
    <>
      <Flex align="center" gap={3}>
        <Text fs="p5" fw={500} mr={2}>
          {t("myAssets.header.feePaymentAsset")}:
        </Text>
        {!isLoading && accountFeePaymentAsset && (
          <Flex align="center" gap={3}>
            <Logo size="small" id={accountFeePaymentAsset.id} />
            <Text fs="p5" fw={600}>
              {accountFeePaymentAsset.symbol}
            </Text>
          </Flex>
        )}
        <TransactionFeePaymentAssetModal>
          <Button
            size="small"
            variant="tertiary"
            disabled={isLoading}
            sx={{ p: 4 }}
          >
            <Icon size={16} component={isLoading ? Spinner : Settings} />
          </Button>
        </TransactionFeePaymentAssetModal>
      </Flex>
    </>
  )
}
