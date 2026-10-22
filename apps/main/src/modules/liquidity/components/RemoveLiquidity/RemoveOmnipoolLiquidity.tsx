import {
  Box,
  Button,
  Checkbox,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

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

  // nothing to pick from with a single position, go straight to the form
  const onlyPosition = positions.length === 1 ? positions : undefined

  if (confirmedSelection || onlyPosition) {
    return (
      <RemoveMultipleOmnipoolLiquidity
        {...props}
        positions={onlyPosition ?? selectedPositions}
        onBack={
          onlyPosition ? props.onBack : () => setConfirmedSelection(false)
        }
      />
    )
  }

  return (
    <>
      <ModalHeader
        title={t("removeLiquidity")}
        closable={props.closable}
        onBack={props.onBack}
      />
      <ModalBody sx={{ gap: "m" }}>
        <Flex direction="column" gap="m">
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="base">
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
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:currentValue")}
              </Text>
            </Flex>

            <Text fs="p5" color={getToken("text.medium")}>
              {t("common:currentApr")}
            </Text>
          </Flex>

          <Box mx="var(--modal-content-inset)">
            <ModalContentDivider />
            <VirtualizedList
              items={positions}
              maxVisibleItems={5}
              itemSize={45}
              separated
              getItemKey={(index) => positions[index]?.positionId ?? index}
              renderItem={(position) => (
                <PositionToRemove
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
              )}
            />
            <ModalContentDivider />
          </Box>

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
