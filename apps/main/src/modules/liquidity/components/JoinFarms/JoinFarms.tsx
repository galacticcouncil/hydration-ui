import {
  Amount,
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { isSS58Address } from "@galacticcouncil/utils"
import { useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AvailableFarms } from "@/modules/liquidity/components/AvailableFarms"
import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"
import { useOmnipoolAsset, useXYKPool } from "@/states/liquidity"

import {
  TJoinFarmsForm,
  useJoinFarmsForm,
  useJoinIsolatedPoolFarms,
  useJoinOmnipoolFarms,
} from "./JoinFarms.utils"
import { JoinFarmsSkeleton } from "./JoinFarmsSkeleton"

type JoinFarmsProps = {
  positionId?: string
  poolId: string
  closable?: boolean
}

export const JoinFarmsWrapper = (props: JoinFarmsProps) =>
  isSS58Address(props.poolId) ? (
    <IsolatedPoolJoinFarmsWrapper {...props} />
  ) : (
    <OmnipoolJoinFarmsWrapper {...props} />
  )

const OmnipoolJoinFarmsWrapper = (props: JoinFarmsProps) => {
  const { data: omnipoolAsset, isLoading: isOmnipoolAssetLoading } =
    useOmnipoolAsset(props.poolId)

  const position = omnipoolAsset?.positions.find(
    (position) => position.positionId === props.positionId,
  )

  if (!omnipoolAsset || isOmnipoolAssetLoading || !position) {
    return <JoinFarmsSkeleton />
  }

  return (
    <OmnipoolJoinFarms
      position={position}
      omnipoolAsset={omnipoolAsset}
      {...props}
    />
  )
}

const IsolatedPoolJoinFarmsWrapper = (props: JoinFarmsProps) => {
  const { data: xykData, isLoading: isXYKLoading } = useXYKPool(props.poolId)

  if (!xykData || isXYKLoading) {
    return <JoinFarmsSkeleton />
  }

  return <IsolatedPoolJoinFarms xykData={xykData} {...props} />
}

const OmnipoolJoinFarms = (
  props: JoinFarmsProps & {
    position: AccountOmnipoolPosition
    omnipoolAsset: OmnipoolAssetTable
  },
) => {
  const { position, omnipoolAsset } = props

  const data = useJoinOmnipoolFarms({
    position,
    omnipoolAsset,
  })

  if (!data) return <JoinFarmsSkeleton />

  return <JoinFarmsForm {...props} {...data} />
}

const IsolatedPoolJoinFarms = (
  props: JoinFarmsProps & { xykData: IsolatedPoolTable },
) => {
  const { xykData, positionId } = props
  const data = useJoinIsolatedPoolFarms({
    xykData,
    positionId,
  })

  if (!data) return <JoinFarmsSkeleton />

  return <JoinFarmsForm {...props} {...data} />
}

const JoinFarmsForm = ({
  onSubmit,
  closable,
  availableFarms,
  meta,
  formValues,
  isEditable,
  displayValue,
}: JoinFarmsProps & {
  availableFarms: Farm[]
  onSubmit: (amount: string) => void
  meta: TAssetData | XYKPoolMeta
  formValues: TJoinFarmsForm
  isEditable?: boolean
  displayValue?: string
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { history } = useRouter()

  const {
    control,
    formState: { isValid },
    handleSubmit,
    trigger,
  } = useJoinFarmsForm(formValues)

  useEffect(() => {
    trigger("amount")
  }, [trigger])

  return (
    <>
      <ModalHeader
        title={t("joinFarms")}
        closable={closable}
        onBack={!closable ? () => history.back() : undefined}
      />
      <ModalBody>
        <AvailableFarms farms={availableFarms} />
        <form
          autoComplete="off"
          onSubmit={handleSubmit((data) => onSubmit(data.amount))}
        >
          <ModalContentDivider
            sx={{ mt: getTokenPx("containers.paddings.primary") }}
          />

          <Flex
            direction="column"
            gap={getTokenPx("containers.paddings.quart")}
            py={getTokenPx("containers.paddings.secondary")}
          >
            {!isEditable && (
              <Text
                fs={14}
                fw={500}
                font="primary"
                color={getToken("text.high")}
              >
                {t("liquidity.joinFarms.modal.currentPositionValue")}
              </Text>
            )}

            <Controller
              name="amount"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) =>
                isEditable ? (
                  <AssetSelect
                    assets={[]}
                    selectedAsset={meta}
                    maxBalance={formValues.amount}
                    value={value}
                    onChange={onChange}
                    error={error?.message}
                    ignoreDisplayValue
                    sx={{ pt: 0 }}
                  />
                ) : (
                  <Flex direction="column">
                    <Flex align="center" justify="space-between" gap={8}>
                      <Text
                        color={getToken("text.medium")}
                        fs="p5"
                        fw={400}
                        width={220}
                      >
                        {t("liquidity.joinFarms.modal.description")}
                      </Text>
                      <Amount
                        value={t("common:currency", {
                          value: value,
                          symbol: meta.symbol,
                        })}
                        displayValue={
                          displayValue
                            ? t("common:currency", {
                                value: displayValue,
                              })
                            : undefined
                        }
                        size="large"
                      />
                    </Flex>
                    {error && (
                      <Text
                        fs={12}
                        font="secondary"
                        fw={400}
                        color={getToken("accents.danger.secondary")}
                        sx={{ marginLeft: "auto", lineHeight: 1 }}
                      >
                        {error.message}
                      </Text>
                    )}
                  </Flex>
                )
              }
            />
          </Flex>

          <ModalContentDivider />

          <Button
            type="submit"
            size="large"
            width="100%"
            mt={getTokenPx("containers.paddings.primary")}
            disabled={!isValid}
          >
            {t("liquidity.joinFarms.modal.submit.btn", {
              count: availableFarms.length,
            })}
          </Button>
        </form>
      </ModalBody>
    </>
  )
}
