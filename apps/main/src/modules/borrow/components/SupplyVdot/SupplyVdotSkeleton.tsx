import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"

export const SupplyVdotSkeleton: FC = () => {
  const { t } = useTranslation(["common", "borrow"])

  return (
    <>
      <ModalHeader title={t("borrow:supply")} closable />
      <ModalBody sx={{ py: 0 }}>
        <Box py="l" width="100%">
          <AssetSelect
            label={t("amount")}
            isDisabled
            isLoading
            assets={[]}
            selectedAsset={undefined}
          />
        </Box>

        <ModalContentDivider />

        <Summary separator={<ModalContentDivider />}>
          <SummaryRow label={t("supplyApy")} content="" loading />
          <SummaryRow
            label={t("borrow:supply.vdot.supplied")}
            content=""
            loading
          />
          <SummaryRow label={t("healthFactor")} content="" loading />
        </Summary>
      </ModalBody>
      <ModalFooter>
        <Button type="submit" size="large" width="100%" disabled>
          {t("borrow:supply")}
        </Button>
      </ModalFooter>
    </>
  )
}
