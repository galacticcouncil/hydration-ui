import {
  AssetInput,
  LoadingButton,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { AssetLogo } from "@/components/AssetLogo"
import { TAsset } from "@/providers/assetsProvider"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

type MultiplyAmountModalProps = {
  title: string
  cta: string
  note?: string
  asset: TAsset
  // human units
  max: string
  maxLabel: string
  priceUsd: number
  isPending: boolean
  onSubmit: (amount: string) => void
  onClose: () => void
}

// Deposit into and withdraw from an existing position: one amount, capped.
export const MultiplyAmountModal: React.FC<MultiplyAmountModalProps> = ({
  title,
  cta,
  note,
  asset,
  max,
  maxLabel,
  priceUsd,
  isPending,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation("common")
  const { control, handleSubmit, formState } = useForm<{ amount: string }>({
    defaultValues: { amount: "" },
    resolver: standardSchemaResolver(
      z.object({
        amount: required.pipe(positive).check(validateFieldMaxBalance(max)),
      }),
    ),
    mode: "onChange",
  })

  return (
    <Modal variant="popup" open onOpenChange={onClose} disableInteractOutside>
      <ModalHeader title={title} />
      <form onSubmit={handleSubmit(({ amount }) => onSubmit(amount))}>
        <ModalBody>
          <Stack gap="l">
            <Controller
              control={control}
              name="amount"
              render={({ field, fieldState }) => (
                <AssetInput
                  label={cta}
                  asset={{
                    symbol: asset.symbol,
                    icon: <AssetLogo id={asset.id} />,
                  }}
                  value={field.value}
                  onChange={field.onChange}
                  displayValue={t("currency", {
                    value: Number(field.value || 0) * priceUsd,
                  })}
                  balance={{
                    label: maxLabel,
                    value: t("number", { value: max }),
                    onMax: () => field.onChange(max),
                    isMaxDisabled: !(Number(max) > 0),
                  }}
                  amountError={fieldState.error?.message}
                />
              )}
            />
            {note && (
              <Text fs="p5" color={getToken("text.medium")}>
                {note}
              </Text>
            )}
          </Stack>
        </ModalBody>
        <Separator />
        <ModalFooter>
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={isPending}
            disabled={!formState.isValid || isPending}
          >
            {cta}
          </LoadingButton>
        </ModalFooter>
      </form>
    </Modal>
  )
}
