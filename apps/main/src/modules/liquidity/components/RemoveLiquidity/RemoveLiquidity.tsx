import {
  AssetButton,
  Button,
  Flex,
  Input,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
  Slider,
  SSliderTabs,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import Big from "big.js"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { TAssetData } from "@/api/assets"
import { AssetLabelFull } from "@/components/AssetLabelFull"
import { DynamicFee } from "@/components/DynamicFee"
import { Logo } from "@/components/Logo"
import { useAssets } from "@/providers/assetsProvider"

import { getIsRemoveAll, useRemoveLiquidity } from "./RemoveLiquidity.utils"

type RemoveLiquidityProps = {
  positionId: string
  poolId: string
}

const options = [
  { id: "25", label: "25%" },
  { id: "50", label: "50%" },
  { id: "75", label: "75%" },
  { id: "100", label: "100%" },
]

const range = { low: 0.33, middle: 0.66, high: 1 }

export const RemoveLiquidity = ({
  positionId,
  poolId,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [customValue, setCustomValue] = useState("")
  const { getAssetWithFallback, hub } = useAssets()
  const asset = getAssetWithFallback(poolId)

  const isRemoveAll = getIsRemoveAll(positionId)

  const form = useForm<{ value: number }>({
    mode: "onChange",
    defaultValues: { value: isRemoveAll ? 100 : 25 },
    resolver: standardSchemaResolver(
      z.object({
        value: z
          .number()
          .min(0.01, t("common:error.minNumber", { value: 0.01 }))
          .max(100, t("common:error.maxNumber", { value: 100 })),
      }),
    ),
  })

  const { values, mutation, totalValue } = useRemoveLiquidity(
    form.watch("value"),
    poolId,
    positionId,
  )

  const onSubmit = () => {
    mutation.mutate()
  }

  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open>
        <ModalHeader title={t("removeLiquidity")} closable={false} />
        <ModalBody>
          <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
            {isRemoveAll ? (
              <Flex
                align="center"
                gap={getTokenPx("containers.paddings.quart")}
                pb={getTokenPx("containers.paddings.primary")}
              >
                <Logo id={asset.id} size="large" />
                <Text
                  fs="h5"
                  fw={500}
                  color={getToken("text.high")}
                  font="primary"
                >
                  {t("common:currency", {
                    value: totalValue,
                    symbol: asset.symbol,
                  })}
                </Text>
              </Flex>
            ) : (
              <Controller
                name="value"
                control={form.control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <>
                    <Flex
                      direction="column"
                      gap={12}
                      pb={getTokenPx("containers.paddings.primary")}
                    >
                      <Flex
                        align="center"
                        justify="space-between"
                        gap={getTokenPx("containers.paddings.quart")}
                        pb={getTokenPx("containers.paddings.quart")}
                      >
                        <AssetButton
                          symbol={asset.symbol}
                          icon={<Logo id={asset.id} />}
                          error={false}
                          disabled
                        />
                        <Text
                          color={
                            form.formState.isValid
                              ? getToken("text.tint.secondary")
                              : getToken("accents.danger.secondary")
                          }
                          fw={400}
                          fs="h5"
                          font="primary"
                        >
                          {t("common:percent", { value })}
                        </Text>
                      </Flex>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={value}
                        onChange={(val) => {
                          setCustomValue("")
                          onChange(val)
                        }}
                      />
                    </Flex>

                    <ModalContentDivider />

                    <Flex
                      direction="column"
                      gap={12}
                      py={getTokenPx("containers.paddings.tertiary")}
                    >
                      <Flex align="center" justify="space-between">
                        <Text color={getToken("text.medium")} fw={400} fs="p5">
                          {t("common:amount")}
                        </Text>
                        <Text color={getToken("text.low")} fw={500} fs="p5">
                          {t("liquidity.remove.modal.balance", {
                            value: totalValue,
                          })}
                        </Text>
                      </Flex>

                      <SSliderTabs>
                        {options.map((option) => {
                          const isSelected = option.id === value.toString()

                          return (
                            <Button
                              key={option.id}
                              variant={isSelected ? "secondary" : "tertiary"}
                              onClick={() => {
                                setCustomValue("")
                                onChange(Number(option.id))
                              }}
                              sx={{
                                flex: 1,
                                background: !isSelected && "transparent",
                              }}
                            >
                              {option.label}
                            </Button>
                          )
                        })}

                        <Input
                          unit={asset.symbol}
                          sx={{ flexBasis: "20%" }}
                          value={customValue}
                          disabled={totalValue === "0"}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\s+/g, "")
                              .replace(/,/g, ".")

                            if (!value) {
                              setCustomValue("")
                              return
                            }

                            const isValid = !Number.isNaN(value)

                            if (isValid) {
                              const percentage = Big(value)
                                .div(Big(totalValue).div(100))
                                .toNumber()

                              setCustomValue(value.toString())
                              onChange(percentage)
                            }
                          }}
                        />
                      </SSliderTabs>
                    </Flex>
                    {error?.message && (
                      <Text
                        fs="p5"
                        color={getToken("accents.danger.secondary")}
                        sx={{ textAlign: "right" }}
                      >
                        {error.message}
                      </Text>
                    )}
                  </>
                )}
              />
            )}

            <ModalContentDivider />

            <Text
              color={getToken("text.tint.secondary")}
              fw={700}
              font="primary"
              sx={{
                pt: getTokenPx("containers.paddings.secondary"),
                pb: getTokenPx("containers.paddings.quart"),
              }}
            >
              {t("liquidity.remove.modal.receive")}
            </Text>

            <Flex
              direction="column"
              gap={12}
              p={getTokenPx("containers.paddings.tertiary")}
              sx={{
                borderRadius: getTokenPx(
                  "containers.cornerRadius.internalPrimary",
                ),
                backgroundColor: getToken("surfaces.containers.dim.dimOnHigh"),
              }}
            >
              <RecieveAsset
                asset={asset}
                value={values?.tokensToGetShifted ?? "0"}
              />
              {values?.hubToGet && values?.hubToGet !== "0" && (
                <RecieveAsset asset={hub} value={values.hubToGet} />
              )}
            </Flex>

            <SummaryRow
              label={t("liquidity.remove.modal.withdrawalFees")}
              content={
                <DynamicFee
                  range={range}
                  value={Number(values?.withdrawalFee)}
                  displayValue
                />
              }
              sx={{ px: getTokenPx("containers.paddings.primary") }}
            />

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={!form.formState.isValid}
            >
              {t("liquidity.remove.modal.submit")}
            </Button>
          </form>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}

const RecieveAsset = ({
  asset,
  value,
}: {
  asset: TAssetData
  value: string
}) => {
  const { t } = useTranslation("common")
  return (
    <Flex gap={12} justify="space-between" align="center">
      <AssetLabelFull asset={asset} withName={false} size="large" />
      <Text fw={600} color={getToken("text.high")} fs="p2">
        {t("number", { value })}
      </Text>
    </Flex>
  )
}
