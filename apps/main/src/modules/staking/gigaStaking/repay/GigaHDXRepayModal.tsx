import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  Amount,
  Button,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Summary,
} from "@galacticcouncil/ui/components"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"

import { GigaHDXRepayFormValues, useGigaHDXRepay } from "./GigaHDXRepay.utils"

type GigaHDXRepayModalProps = {
  open: boolean
  onClose: () => void
}

export const GigaHDXRepayModal = ({
  open,
  onClose,
}: GigaHDXRepayModalProps) => {
  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <GigaHDXRepayForm onClose={onClose} open={open} />
    </Modal>
  )
}

const GigaHDXRepayForm = ({ onClose }: GigaHDXRepayModalProps) => {
  const { t } = useTranslation(["common", "borrow", "staking"])
  const {
    form,
    healthFactor,
    onSubmit,
    mutation,
    maxRepayAmountString,
    maxRepayWei,
    walletBalance,
    remainingDebt,
    remainingDebtUsd,
    hollarAsset,
    hollarReserve,
  } = useGigaHDXRepay({ onClose })

  return (
    <FormProvider {...form}>
      <ModalHeader title={t("borrow:repay")} />
      <form onSubmit={onSubmit} autoComplete="off">
        <ModalBody sx={{ pt: 0 }}>
          <AssetSelectFormField<GigaHDXRepayFormValues>
            assetFieldName="asset"
            amountFieldName="amount"
            label={t("amount")}
            assets={[]}
            disabledAssetSelector
            maxBalance={walletBalance}
            maxButtonBalance={maxRepayAmountString}
          />

          <ModalContentDivider />
          <Summary
            separator={<ModalContentDivider />}
            rows={[
              {
                label: "Remaining debt",
                content: (
                  <Amount
                    value={t("currency", {
                      value: remainingDebt.toString(),
                      symbol: hollarAsset.symbol,
                    })}
                    displayValue={t("currency", {
                      value: remainingDebtUsd.toString(),
                    })}
                    sx={{ textAlign: "right" }}
                  />
                ),
              },
              {
                label: t("borrow:healthFactor"),
                content: <HealthFactorChange {...healthFactor} />,
              },
            ]}
          />
        </ModalBody>
        <Separator />
        <ModalFooter>
          <Button
            type="submit"
            size="large"
            width="100%"
            disabled={
              !form.formState.isValid ||
              mutation.isPending ||
              maxRepayWei <= 0n ||
              !hollarReserve
            }
          >
            {t("borrow:repay")}
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  )
}
