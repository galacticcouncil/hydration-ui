import {
  Button,
  Checkbox,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { RemoveSelectableStablepoolPositions } from "@/modules/liquidity/components/RemoveLiquidity/RemoveStablepoolLiquidity"
import {
  AccountOmnipoolPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

import { AmountToRemove } from "./AmountToRemove"
import { PositionToRemove } from "./PositionToRemove"
import { RemoveLiquidityForm, RemoveLiquidityProps } from "./RemoveLiquidity"
import { useRemoveSelectablePositions } from "./RemoveLiquidity.utils"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"
import {
  useRemoveMultipleOmnipoolPositions,
  useRemoveSingleOmnipoolPosition,
} from "./RemoveOmnipoolLiquidity.utils"

export const RemoveSelectablePositions = (props: RemoveLiquidityProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const format = useFormatOmnipoolPositionData()
  const [confirmedSelection, setConfirmedSelection] = useState(false)

  const {
    positions,
    activeFarms,
    setSelectedPositionIds,
    selectedPositionIds,
    removableValues,
    selectedPositions,
    selectedDeposits,
  } = useRemoveSelectablePositions(props)

  const onSelectPosition = (position: AccountOmnipoolPosition) => {
    setSelectedPositionIds((prev) => new Set([...prev, position.positionId]))
  }

  const onUnselectPosition = (position: AccountOmnipoolPosition) => {
    setSelectedPositionIds((prev) => {
      const newSet = new Set(prev)

      newSet.delete(position.positionId)

      return newSet
    })
  }

  if (confirmedSelection) {
    if (props.stableswapId) {
      return (
        <RemoveSelectableStablepoolPositions
          {...props}
          stableswapId={props.stableswapId}
          positions={selectedPositions}
          onBack={() => setConfirmedSelection(false)}
        />
      )
    } else {
      return (
        <RemoveMultipleOmnipoolLiquidity
          {...props}
          positions={selectedPositions}
          onBack={() => setConfirmedSelection(false)}
        />
      )
    }
  }

  return (
    <>
      <ModalHeader
        title={t("removeLiquidity")}
        closable={props.closable}
        onBack={props.onBack}
      />
      <ModalBody sx={{ gap: 12 }}>
        <Flex direction="column" gap={12}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={8}>
              <Checkbox
                checked={
                  !!positions.length &&
                  selectedPositionIds.size === positions.length
                }
                onCheckedChange={() => {
                  if (selectedPositionIds.size === positions.length) {
                    setSelectedPositionIds(new Set())
                  } else {
                    setSelectedPositionIds(
                      new Set(positions.map((pos) => pos.positionId)),
                    )
                  }
                }}
              />
              <Text fs={12} color={getToken("text.medium")}>
                {t("common:currentValue")}
              </Text>
            </Flex>

            <Text fs={12} color={getToken("text.medium")}>
              {t("common:currentApr")}
            </Text>
          </Flex>

          <Stack separated sx={{ maxHeight: 250, overflowY: "auto", mx: -20 }}>
            {positions.map((position) => (
              <PositionToRemove
                key={position.positionId}
                position={position}
                value={format(position.data)}
                displayValue={position.data.currentTotalDisplay}
                activeFarms={activeFarms}
                selected={position.isSelected}
                onClick={() =>
                  position.isSelected
                    ? onUnselectPosition(position)
                    : onSelectPosition(position)
                }
              />
            ))}
          </Stack>

          <ModalContentDivider />

          <AmountToRemove
            assets={removableValues}
            positions={selectedDeposits}
          />

          <ModalContentDivider />

          <Button
            size="large"
            width="100%"
            disabled={!selectedPositions.length}
            onClick={() => setConfirmedSelection(true)}
          >
            {t("liquidity.remove.modal.multiple.button")}
          </Button>
        </Flex>
      </ModalBody>
    </>
  )
}

export const RemoveOmnipoolLiquidity = (props: RemoveLiquidityProps) => {
  const { positionId, poolId } = props
  const { getAssetPositions, isLoading } = useAccountOmnipoolPositionsData()
  const { all: omnipoolPositions } = getAssetPositions(poolId)

  const position = positionId
    ? omnipoolPositions.find((position) => position.positionId === positionId)
    : undefined

  if (isLoading || !omnipoolPositions.length) return <RemoveLiquiditySkeleton />

  if (position) {
    return <RemoveSingleOmnipoolLiquidity position={position} {...props} />
  }

  return (
    <RemoveMultipleOmnipoolLiquidity positions={omnipoolPositions} {...props} />
  )
}

const RemoveSingleOmnipoolLiquidity = (
  props: RemoveLiquidityProps & { position: AccountOmnipoolPosition },
) => {
  const { poolId, position, onSubmitted } = props
  const removeLiquidity = useRemoveSingleOmnipoolPosition({
    poolId,
    position,
    onSubmitted,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton {...props} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm {...props} {...removeLiquidityData} />
    </FormProvider>
  )
}

const RemoveMultipleOmnipoolLiquidity = (
  props: RemoveLiquidityProps & { positions: AccountOmnipoolPosition[] },
) => {
  const { poolId, positions, onSubmitted } = props
  const removeLiquidity = useRemoveMultipleOmnipoolPositions({
    poolId,
    positions,
    onSubmitted,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton {...props} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm {...props} {...removeLiquidityData} />
    </FormProvider>
  )
}
