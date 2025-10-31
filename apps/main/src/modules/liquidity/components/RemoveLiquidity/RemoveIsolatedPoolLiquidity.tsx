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

import { XykDeposit } from "@/api/account"
import { useXykPools } from "@/api/pools"
import { useAccountPositions } from "@/states/account"

import { AmountToRemove } from "./AmountToRemove"
import { PositionToRemove } from "./PositionToRemove"
import {
  TRemoveXykPositionsProps,
  useRemoveMultipleXYKPositions,
  useRemoveSelectableXYKPositions,
  useRemoveSingleXYKPosition,
  useRemoveXYKShares,
} from "./RemoveIsolatedPoolLiquidity.uitls"
import { RemoveLiquidityForm, RemoveLiquidityProps } from "./RemoveLiquidity"
import { RemoveLiquiditySkeleton } from "./RemoveLiquiditySkeleton"

export const RemoveSelectableXYKPositions = (props: RemoveLiquidityProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [confirmedSelection, setConfirmedSelection] = useState(false)
  const selectablePositions = useRemoveSelectableXYKPositions(props)

  if (!selectablePositions) return <RemoveLiquiditySkeleton {...props} />

  const {
    removableValues,
    positions,
    activeFarms,
    setSelectedPositionIds,
    selectedPositionIds,
    selectedPositions,
    tokens,
    address,
  } = selectablePositions

  const onSelectPosition = (position: XykDeposit) => {
    setSelectedPositionIds((prev) => new Set(prev.add(position.id)))
  }

  const onUnselectPosition = (position: XykDeposit) => {
    setSelectedPositionIds((prev) => {
      const newSet = new Set(prev)

      newSet.delete(position.id)

      return newSet
    })
  }

  if (confirmedSelection) {
    return (
      <RemoveMultipleIsolatedPoolLiquidity
        positions={selectedPositions}
        poolTokens={tokens}
        address={address}
        {...props}
        onBack={() => setConfirmedSelection(false)}
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
                      new Set(positions.map((pos) => pos.id)),
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
                key={position.id}
                position={position}
                value={t("common:number", { value: position.sharesShifted })}
                displayValue={position.sharesDisplay}
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
            positions={selectedPositions}
          />

          <ModalContentDivider />

          <Button
            type="submit"
            size="large"
            width="100%"
            onClick={() => setConfirmedSelection(true)}
          >
            {t("removeLiquidity")}
          </Button>
        </Flex>
      </ModalBody>
    </>
  )
}

export const RemoveIsolatedPoolsLiquidity = (props: RemoveLiquidityProps) => {
  const { positionId } = props
  const { getPositions } = useAccountPositions()
  const { data: pools } = useXykPools()

  const pool = pools?.find((pool) => pool.address === props.poolId)
  const positions = getPositions(props.poolId).xykMiningPositions

  if (!positions || !pool) return <RemoveLiquiditySkeleton {...props} />

  if (props.shareTokenId) {
    return (
      <RemoveXYKShares
        shareTokenId={props.shareTokenId}
        poolTokens={pool.tokens}
        address={pool.address}
        {...props}
      />
    )
  }

  const position = positionId
    ? positions.find((position) => position.id === positionId)
    : undefined

  if (position) {
    return (
      <RemoveSingleIsolatedPoolLiquidity
        position={position}
        poolTokens={pool.tokens}
        address={pool.address}
        {...props}
      />
    )
  }

  if (positions.length) {
    return (
      <RemoveMultipleIsolatedPoolLiquidity
        positions={positions}
        poolTokens={pool.tokens}
        address={pool.address}
        {...props}
      />
    )
  }
}

export const RemoveMultipleIsolatedPoolLiquidity = (
  props: RemoveLiquidityProps &
    TRemoveXykPositionsProps & { positions: XykDeposit[] },
) => {
  const removeLiquidity = useRemoveMultipleXYKPositions({
    positions: props.positions,
    poolTokens: props.poolTokens,
    address: props.address,
  })

  if (!removeLiquidity) return <RemoveLiquiditySkeleton {...props} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm {...props} {...removeLiquidityData} />
    </FormProvider>
  )
}

export const RemoveSingleIsolatedPoolLiquidity = (
  props: RemoveLiquidityProps &
    TRemoveXykPositionsProps & { position: XykDeposit },
) => {
  const removeLiquidity = useRemoveSingleXYKPosition(props)

  if (!removeLiquidity) return <RemoveLiquiditySkeleton {...props} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm {...props} {...removeLiquidityData} />
    </FormProvider>
  )
}

export const RemoveXYKShares = (
  props: RemoveLiquidityProps &
    TRemoveXykPositionsProps & { shareTokenId: string },
) => {
  const removeLiquidity = useRemoveXYKShares(props)

  if (!removeLiquidity) return <RemoveLiquiditySkeleton {...props} />

  const { form, ...removeLiquidityData } = removeLiquidity

  return (
    <FormProvider {...form}>
      <RemoveLiquidityForm {...props} {...removeLiquidityData} />
    </FormProvider>
  )
}
