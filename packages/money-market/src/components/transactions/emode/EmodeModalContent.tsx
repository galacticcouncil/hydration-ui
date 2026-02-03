import { formatUserSummary } from "@aave/math-utils"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Flex,
  Icon,
  Separator,
  Stack,
  SummaryRow,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"

import { HealthFactorChange } from "@/components/primitives"
import { EmodeCategory } from "@/helpers/types"
import {
  AppDataContextType,
  useAppDataContext,
} from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useCurrentTimestamp } from "@/hooks/useCurrentTimestamp"

import { getEmodeMessage } from "./emode.utils"
import { EmodeActions } from "./EmodeActions"
import { EmodeSelect } from "./EmodeSelect"

export enum ErrorType {
  EMODE_DISABLED_LIQUIDATION,
  CLOSE_POSITIONS_BEFORE_SWITCHING,
  CLOSE_POSITIONS_BEFORE_DISABLING,
}

export enum EmodeModalType {
  ENABLE = "Enable",
  DISABLE = "Disable",
  SWITCH = "Manage",
}

export interface EmodeModalContentProps {
  mode: EmodeModalType
}

function getInitialEmode(
  mode: EmodeModalType,
  eModes: AppDataContextType["eModes"],
  currentEmode: number,
) {
  if (mode === EmodeModalType.ENABLE) {
    return eModes[1]
  }
  if (mode === EmodeModalType.SWITCH) {
    if (currentEmode === 1) return eModes[2]
    return eModes[1]
  }
  return eModes[0]
}

export const EmodeModalContent = ({ mode }: EmodeModalContentProps) => {
  const {
    user,
    reserves,
    eModes,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
    userReserves,
  } = useAppDataContext()
  const { formatPercent } = useAppFormatters()
  const currentTimestamp = useCurrentTimestamp(1)

  const [selectedEmode, setSelectedEmode] = useState<EmodeCategory | undefined>(
    getInitialEmode(mode, eModes, user.userEmodeCategoryId),
  )

  const [disableMode, setDisableMode] = useState(false)

  // calcs
  const newSummary = formatUserSummary({
    currentTimestamp,
    userReserves: userReserves,
    formattedReserves: reserves,
    userEmodeCategoryId: selectedEmode ? selectedEmode.id : 0,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
  })

  // error handling
  let blockingError: ErrorType | undefined = undefined
  // if user is disabling eMode
  if (user.isInEmode && selectedEmode?.id === 0) {
    if (
      Number(newSummary.healthFactor) < 1.01 &&
      newSummary.healthFactor !== "-1"
    ) {
      blockingError = ErrorType.EMODE_DISABLED_LIQUIDATION // intl.formatMessage(messages.eModeDisabledLiquidation);
    }
  } else if (selectedEmode && user.userEmodeCategoryId !== selectedEmode?.id) {
    // check if user has open positions different than future emode
    const hasIncompatiblePositions = user.userReservesData.some(
      (userReserve) =>
        (Number(userReserve.scaledVariableDebt) > 0 ||
          Number(userReserve.principalStableDebt) > 0) &&
        userReserve.reserve.eModeCategoryId !== selectedEmode?.id,
    )
    if (hasIncompatiblePositions) {
      if (disableMode) {
        blockingError = ErrorType.CLOSE_POSITIONS_BEFORE_DISABLING
      } else {
        blockingError = ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING
      }
    }
  }
  // render error messages
  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING:
        return (
          <Alert
            variant="info"
            description={`To enable E-mode for the ${selectedEmode && getEmodeMessage(selectedEmode.label)} category, all borrow positions outside of this category must be closed.`}
          />
        )
      case ErrorType.CLOSE_POSITIONS_BEFORE_DISABLING:
        return (
          <Alert
            variant="info"
            description={`To disable E-mode for the ${selectedEmode && getEmodeMessage(eModes[user.userEmodeCategoryId].label)} category, all borrow positions within this category must be closed.`}
          />
        )
      case ErrorType.EMODE_DISABLED_LIQUIDATION:
        return (
          <Alert
            variant="error"
            title="Cannot disable E-Mode"
            description="You can not disable E-Mode as your current collateralization level is above 80%, disabling E-Mode can cause liquidation. To exit E-Mode supply or repay borrowed positions."
          />
        )
      default:
        return null
    }
  }

  // The selector only shows if there are 2 options for the user, which happens when there are 3 emodeCategories (including disable) for mode.enable, and 4 emodeCategories in mode.switch
  const showCategorySelect: boolean =
    (Object.keys(eModes).length >= 3 && mode === EmodeModalType.ENABLE) ||
    (Object.keys(eModes).length >= 4 && mode === EmodeModalType.SWITCH)

  // Shown only if the user is disabling eMode, is not blocked from disabling, and has a health factor that is decreasing
  // HF will never decrease on enable or switch because all borrow positions must initially be in the eMode category
  const showLiquidationRiskAlert: boolean =
    !!selectedEmode &&
    selectedEmode.id === 0 &&
    blockingError === undefined &&
    Number(newSummary.healthFactor).toFixed(3) <
      Number(user.healthFactor).toFixed(3) // Comparing without rounding causes stuttering, HFs update asyncronously

  // Shown only if the user has a collateral asset which is changing in LTV
  const showMaxLTVRow =
    user.currentLoanToValue !== "0" &&
    Number(newSummary.currentLoanToValue).toFixed(3) !==
      Number(user.currentLoanToValue).toFixed(3) // Comparing without rounding causes stuttering, LTVs update asyncronously

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = newSummary.healthFactor.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  const isUserEmodeCategorySet = user.userEmodeCategoryId !== 0

  return (
    <>
      {isUserEmodeCategorySet && (
        <>
          <Flex
            as="label"
            justify="space-between"
            align="center"
            gap="s"
            bg={getToken("surfaces.containers.dim.dimOnBg")}
            p="xl"
            mb="var(--modal-content-padding)"
            borderRadius="m"
          >
            <Text fs="p2" fw={700} lh={1}>
              Disable E-Mode
            </Text>
            <Toggle
              checked={disableMode}
              onCheckedChange={setDisableMode}
              name="Disable e-mode"
              size="large"
            />
          </Flex>
          <Separator mx="var(--modal-content-inset)" />
        </>
      )}

      {!disableMode && (
        <Stack
          mt={!isUserEmodeCategorySet && "var(--modal-content-inset)"}
          separated
          separator={<Separator mx="var(--modal-content-inset)" />}
          withTrailingSeparator
        >
          {!showCategorySelect && (
            <SummaryRow
              label="E-Mode category"
              content={
                <Flex gap="s" justify="flex-end" align="center">
                  <Flex align="center" justify="flex-end">
                    {user.userEmodeCategoryId !== 0 ? (
                      <Text fw={500}>
                        {getEmodeMessage(
                          eModes[user.userEmodeCategoryId].label,
                        )}
                      </Text>
                    ) : (
                      <Text fw={500}>None</Text>
                    )}
                  </Flex>
                  {selectedEmode && (
                    <>
                      <Icon size="s" component={ArrowRight} />
                      <Flex align="center" justify="flex-end">
                        {selectedEmode.id !== 0 ? (
                          <Text
                            fw={500}
                            color={getToken("accents.success.emphasis")}
                          >
                            {getEmodeMessage(eModes[selectedEmode.id].label)}
                          </Text>
                        ) : (
                          <Text
                            fw={500}
                            color={getToken("accents.success.emphasis")}
                          >
                            None
                          </Text>
                        )}
                      </Flex>
                    </>
                  )}
                </Flex>
              }
            />
          )}
          {showCategorySelect && (
            <SummaryRow
              label="E-Mode category"
              content={
                <EmodeSelect
                  emodeCategories={eModes}
                  selectedEmode={selectedEmode?.id}
                  setSelectedEmode={setSelectedEmode}
                  userEmode={user.userEmodeCategoryId}
                />
              }
            />
          )}
          <SummaryRow
            label="Available assets"
            content={
              <Flex gap="s" justify="flex-end" align="center" maxWidth="50%">
                {eModes[user.userEmodeCategoryId] && (
                  <Flex align="center" justify="flex-end">
                    {user.userEmodeCategoryId !== 0 ? (
                      <Text fs="p6" fw={500} align="right">
                        {eModes[user.userEmodeCategoryId].assets.join(", ")}
                      </Text>
                    ) : (
                      <Text fs="p6" align="right" fw={500} whiteSpace="nowrap">
                        All Assets
                      </Text>
                    )}
                  </Flex>
                )}
                {selectedEmode && (
                  <>
                    <Icon
                      size="xs"
                      component={ArrowRight}
                      sx={{ flexShrink: 0 }}
                    />
                    <Flex align="center" justify="flex-end">
                      {selectedEmode?.id !== 0 ? (
                        <Text
                          fs="p6"
                          fw={500}
                          align="right"
                          color={getToken("accents.success.emphasis")}
                        >
                          {selectedEmode.assets.join(", ")}
                        </Text>
                      ) : (
                        <Text
                          fs="p6"
                          fw={500}
                          align="right"
                          color={getToken("accents.success.emphasis")}
                        >
                          All Assets
                        </Text>
                      )}
                    </Flex>
                  </>
                )}
              </Flex>
            }
          />
          {shouldRenderHealthFactor && (
            <SummaryRow
              label="Health Factor"
              content={
                <HealthFactorChange
                  healthFactor={healthFactor}
                  futureHealthFactor={futureHealthFactor}
                />
              }
            />
          )}
          {showMaxLTVRow && (
            <SummaryRow
              label="Maximum loan to value"
              content={
                <Flex align="center" justify="flex-end" gap="s">
                  <Text fs="p6" fw={500}>
                    {formatPercent(Number(user.currentLoanToValue) * 100)}
                  </Text>
                  {selectedEmode !== undefined && (
                    <>
                      <Icon size="xs" component={ArrowRight} />
                      <Text fs="p6" fw={500}>
                        {formatPercent(
                          Number(newSummary.currentLoanToValue) * 100,
                        )}
                      </Text>
                    </>
                  )}
                </Flex>
              }
            />
          )}
        </Stack>
      )}

      <Stack gap="m" py="m">
        {(blockingError === ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING ||
          blockingError === ErrorType.CLOSE_POSITIONS_BEFORE_DISABLING) && (
          <BlockingError />
        )}
        {user.userEmodeCategoryId === 0 && (
          <Alert
            variant="warning"
            description=" Enabling E-Mode only allows you to borrow assets belonging to the selected category."
          />
        )}
        {blockingError === ErrorType.EMODE_DISABLED_LIQUIDATION && (
          <BlockingError />
        )}
        {showLiquidationRiskAlert && (
          <Alert
            variant="error"
            title="Liquidation risk"
            description="This action will reduce your health factor. Please be mindful of the increased risk of collateral liquidation."
          />
        )}
      </Stack>

      <Separator mx="var(--modal-content-inset)" />

      <EmodeActions
        blocked={blockingError !== undefined || !selectedEmode}
        selectedEmode={disableMode ? 0 : selectedEmode?.id || 0}
        activeEmode={user.userEmodeCategoryId}
        eModes={eModes}
      />
    </>
  )
}
