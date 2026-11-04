import {
  AssetInput,
  Box,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
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
  // replaces `note` while the amount is the max
  maxNote?: string
  // rendered below the input, from the amount being entered
  summary?: (amount: string, isMax: boolean) => React.ReactNode
  asset: TAsset
  // human units
  max: string
  maxLabel: string
  priceUsd: number
  isPending: boolean
  onSubmit: (amount: string, isMax: boolean) => void
  onClose: () => void
}

// Deposit into and withdraw from an existing position: one amount, capped.
export const MultiplyAmountModal: React.FC<MultiplyAmountModalProps> = ({
  title,
  cta,
  note,
  maxNote,
  summary,
  asset,
  max,
  maxLabel,
  priceUsd,
  isPending,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation("common")
  const { control, handleSubmit, formState, watch } = useForm<{
    amount: string
  }>({
    defaultValues: { amount: "" },
    resolver: standardSchemaResolver(
      z.object({
        amount: required.pipe(positive).check(validateFieldMaxBalance(max)),
      }),
    ),
    mode: "onChange",
  })

  const amount = watch("amount")
  const isMax = amount === max
  const shownNote = isMax && maxNote ? maxNote : note

  return (
    <Modal variant="popup" open onOpenChange={onClose} disableInteractOutside>
      <ModalHeader title={title} />
      <form
        onSubmit={handleSubmit(({ amount }) =>
          onSubmit(amount, amount === max),
        )}
      >
        <ModalBody>
          <Box pb="l">
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
          </Box>
          {summary?.(amount, isMax)}
          {shownNote && (
            <>
              <ModalContentDivider />
              <Text fs="p5" color={getToken("text.medium")} pt="l">
                {shownNote}
              </Text>
            </>
          )}
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
