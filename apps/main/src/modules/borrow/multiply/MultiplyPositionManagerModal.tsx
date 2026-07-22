import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Flex,
  Icon,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
  Stack,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import z from "zod"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { NoData } from "@/modules/borrow/components/NoData"
import { useUnlooping } from "@/modules/borrow/multiply/hooks/useUnlooping"
import { MultiplyPositionRow } from "@/modules/borrow/multiply/MultiplyPositionsTable.columns"
import { calculateEffectiveLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { useAssets } from "@/providers/assetsProvider"
import {
  maxBalanceError,
  required,
  validateMaxBalance,
} from "@/utils/validators"

const managePositionBaseSchema = z.object({
  amount: required,
})

type ManagePositionFormValues = z.infer<typeof managePositionBaseSchema>

const createManagePositionSchema = (debtAmount: string) =>
  managePositionBaseSchema.check(
    z.refine((data) => validateMaxBalance(debtAmount, data.amount), {
      path: ["amount"],
      error: maxBalanceError,
    }),
  )

export const MultiplyPositionManagerModal = ({
  position,
  onClose,
}: {
  position: MultiplyPositionRow | null
  onClose: () => void
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  const debtAsset = position ? getAsset(position.pair.debtAssetId) : null
  const collateralAsset = position
    ? getAsset(position.pair.collateralAssetId)
    : null

  const managePositionSchema = useMemo(
    () => createManagePositionSchema(position?.debtAmount ?? "0"),
    [position?.debtAmount],
  )

  const form = useForm<ManagePositionFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
    },
    resolver: standardSchemaResolver(managePositionSchema),
  })

  const amount = form.watch("amount")

  useEffect(() => {
    form.reset({ amount: "" })
  }, [form, position?.id])

  const { submit, isLoading, errors, remainingCollateral, remainingDebt } =
    useUnlooping(
      {
        currentCollateral: position?.collateralAmount ?? "0",
        currentDebt: position?.debtAmount ?? "0",
        repayAmount: amount,
        supplyAssetId: position?.pair.collateralAssetId ?? "",
        borrowAssetId: position?.pair.debtAssetId ?? "",
        assetInId: position?.pair.debtAssetId ?? "",
        assetOutId: position?.pair.collateralAssetId ?? "",
        enterWithAssetId: position?.pair.enterWithAssetId,
      },
      {
        onSubmitted: () => {
          console.log("CLOSING")
          onClose()
        },
      },
    )

  const hasInput = !!amount && new Big(amount || "0").gt(0)

  const { futureCollateral, futureDebt, currentLeverage, futureLeverage } =
    useMemo(() => {
      if (!position) {
        return {
          futureCollateral: "0",
          futureDebt: "0",
          currentLeverage: null as number | null,
          futureLeverage: null as number | null,
        }
      }
      const futureCollateralVal = hasInput
        ? remainingCollateral
        : position.collateralAmount
      const futureDebtVal = hasInput ? remainingDebt : position.debtAmount
      return {
        futureCollateral: futureCollateralVal,
        futureDebt: futureDebtVal,
        currentLeverage: calculateEffectiveLeverage(
          position.collateralAmount,
          position.debtAmount,
        ),
        futureLeverage: calculateEffectiveLeverage(
          futureCollateralVal,
          futureDebtVal,
        ),
      }
    }, [position, hasInput, remainingCollateral, remainingDebt])

  if (!position) return null

  return (
    <Modal
      open={!!position}
      onOpenChange={(open) => !open && onClose()}
      disableInteractOutside
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => submit())}>
          <ModalHeader title={t("borrow:multiply.positions.manage")} />
          <Separator />
          <ModalBody>
            <Stack>
              <Controller
                control={form.control}
                name="amount"
                render={({ field, fieldState }) => (
                  <AssetSelect
                    sx={{ pt: 0 }}
                    label={t("asset")}
                    assets={[]}
                    selectedAsset={debtAsset}
                    value={field.value}
                    onChange={field.onChange}
                    maxBalance={position.debtAmount}
                    maxBalanceFallback={position.debtAmount}
                    amountError={fieldState.error?.message}
                  />
                )}
              />

              <ModalContentDivider />

              <Summary
                separator={<ModalContentDivider />}
                withTrailingSeparator
              >
                <SummaryRow
                  label={t("borrow:collateral")}
                  content={
                    <Flex align="center" gap="s" wrap>
                      <Text fs="p5" fw={500} color={getToken("text.high")}>
                        {t("currency", {
                          value: position.collateralAmount,
                          symbol: collateralAsset?.symbol,
                        })}
                      </Text>
                      <Icon
                        component={ArrowRight}
                        size="s"
                        color={getToken("text.medium")}
                      />
                      <Text fs="p5" fw={500} color={getToken("text.high")}>
                        {t("currency", {
                          value: futureCollateral,
                          symbol: collateralAsset?.symbol,
                        })}
                      </Text>
                    </Flex>
                  }
                />
                <SummaryRow
                  label={t("borrow:debt")}
                  content={
                    <Flex align="center" gap="s" wrap>
                      <Text fs="p5" fw={500} color={getToken("text.high")}>
                        {t("currency", {
                          value: position.debtAmount,
                          symbol: debtAsset?.symbol,
                        })}
                      </Text>
                      <Icon
                        component={ArrowRight}
                        size="s"
                        color={getToken("text.medium")}
                      />
                      <Text fs="p5" fw={500} color={getToken("text.high")}>
                        {t("currency", {
                          value: futureDebt,
                          symbol: debtAsset?.symbol,
                        })}
                      </Text>
                    </Flex>
                  }
                />
                <SummaryRow
                  label={t("borrow:multiply.app.leverage")}
                  content={
                    <Flex align="center" gap="s" sx={{ flexWrap: "wrap" }}>
                      {currentLeverage !== null ? (
                        <Text fs="p5" fw={500} color={getToken("text.high")}>
                          {t("multiplier", { value: currentLeverage })}
                        </Text>
                      ) : (
                        <NoData />
                      )}
                      <Icon
                        component={ArrowRight}
                        size="s"
                        color={getToken("text.medium")}
                      />
                      {futureLeverage !== null ? (
                        <Text fs="p5" fw={500} color={getToken("text.high")}>
                          {t("multiplier", { value: futureLeverage })}
                        </Text>
                      ) : (
                        <NoData />
                      )}
                    </Flex>
                  }
                />
              </Summary>

              {errors.length > 0 && (
                <Stack gap="s">
                  {errors.map((error) => (
                    <Alert key={error} variant="error" title={error} />
                  ))}
                </Stack>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter sx={{ pt: 0 }}>
            <AuthorizedAction size="large" width="100%">
              <LoadingButton
                isLoading={isLoading}
                disabled={
                  isLoading ||
                  errors.length > 0 ||
                  !hasInput ||
                  !form.formState.isValid
                }
                variant="primary"
                size="large"
                width="100%"
                type="submit"
              >
                {Big(remainingDebt).lte(0) && Big(remainingCollateral).lte(0)
                  ? t("borrow:multiply.positions.remove")
                  : t("borrow:multiply.positions.update")}
              </LoadingButton>
            </AuthorizedAction>
          </ModalFooter>
        </form>
      </FormProvider>
    </Modal>
  )
}
