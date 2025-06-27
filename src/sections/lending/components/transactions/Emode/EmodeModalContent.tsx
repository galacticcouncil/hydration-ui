import { formatUserSummary } from "@aave/math-utils"
import { useState } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Row } from "sections/lending/components/primitives/Row"
import { EmodeCategory } from "sections/lending/helpers/types"
import {
  AppDataContextType,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useCurrentTimestamp } from "sections/lending/hooks/useCurrentTimestamp"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsHFLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { EmodeActions } from "./EmodeActions"
import { getEmodeMessage } from "./EmodeNaming"
import { EmodeSelect } from "./EmodeSelect"
import { ChainId } from "sections/lending/ui-config/networksConfig"
import { Switch } from "components/Switch/Switch"

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
  const { currentChainId: chainId } = useProtocolDataContext()
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context()
  const currentTimestamp = useCurrentTimestamp(1)
  const { mainTxState: emodeTxState, txError } = useModalContext()

  const [selectedEmode, setSelectedEmode] = useState<EmodeCategory | undefined>(
    getInitialEmode(mode, eModes, user.userEmodeCategoryId),
  )

  const [disableMode, setDisableMode] = useState(false)

  const currentChainId =
    chainId === ChainId.hydration_testnet ? ChainId.hydration : chainId

  const networkConfig = getNetworkConfig(currentChainId)

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
  const Blocked: React.FC = () => {
    switch (blockingError) {
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING:
        return (
          <Alert variant="info" sx={{ mt: 12, align: "center" }}>
            <Text fs={13}>
              <span>
                To enable E-mode for the{" "}
                {selectedEmode && getEmodeMessage(selectedEmode.label)}{" "}
                category, all borrow positions outside of this category must be
                closed.
              </span>
            </Text>
          </Alert>
        )
      case ErrorType.CLOSE_POSITIONS_BEFORE_DISABLING:
        return (
          <Alert variant="info" sx={{ mt: 12, align: "center" }}>
            <Text fs={13}>
              To disable E-mode for the{" "}
              {selectedEmode &&
                getEmodeMessage(eModes[user.userEmodeCategoryId].label)}{" "}
              category, all borrow positions within this category must be
              closed.
            </Text>
          </Alert>
        )
      case ErrorType.EMODE_DISABLED_LIQUIDATION:
        return (
          <Alert variant="error" sx={{ mt: 12, align: "center" }}>
            <Text fs={13}>Cannot disable E-Mode</Text>
            <Text fs={13}>
              You can not disable E-Mode as your current collateralization level
              is above 80%, disabling E-Mode can cause liquidation. To exit
              E-Mode supply or repay borrowed positions.
            </Text>
          </Alert>
        )
      default:
        return null
    }
  }

  // The selector only shows if there are 2 options for the user, which happens when there are 3 emodeCategories (including disable) for mode.enable, and 4 emodeCategories in mode.switch
  const showModal: boolean =
    (Object.keys(eModes).length >= 3 && mode === EmodeModalType.ENABLE) ||
    (Object.keys(eModes).length >= 4 && mode === EmodeModalType.SWITCH)

  // is Network mismatched
  const isWrongNetwork: boolean = currentChainId !== connectedChainId

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

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />
  }
  if (emodeTxState.success) return <TxSuccessView action={<span>Emode</span>} />
  return (
    <>
      {user.userEmodeCategoryId !== 0 ? (
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            gap: 4,
            align: "center",
            py: 16,
          }}
        >
          <Text>Disable E-Mode</Text>
          <Switch
            value={disableMode}
            onCheckedChange={setDisableMode}
            name="Disable e-mode"
            size="small"
          />
        </div>
      ) : null}
      {!disableMode && (
        <TxModalDetails>
          {!showModal && (
            <Row captionColor="basic400" caption={<span>E-Mode category</span>}>
              <div sx={{ flex: "row", justify: "right", align: "center" }}>
                <div sx={{ align: "center" }} css={{ display: "inline-flex" }}>
                  {user.userEmodeCategoryId !== 0 ? (
                    <>
                      <span>
                        {getEmodeMessage(
                          eModes[user.userEmodeCategoryId].label,
                        )}
                      </span>
                    </>
                  ) : (
                    <span>None</span>
                  )}
                </div>
                {selectedEmode && (
                  <>
                    <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                    <div
                      css={{ display: "inline-flex" }}
                      sx={{ align: "center" }}
                    >
                      {selectedEmode.id !== 0 ? (
                        <>
                          <span>
                            {getEmodeMessage(eModes[selectedEmode.id].label)}
                          </span>
                        </>
                      ) : (
                        <span>None</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Row>
          )}

          {showModal && (
            <EmodeSelect
              emodeCategories={eModes}
              selectedEmode={selectedEmode?.id}
              setSelectedEmode={setSelectedEmode}
              userEmode={user.userEmodeCategoryId}
            />
          )}

          <Row captionColor="basic400" caption={<span>Available assets</span>}>
            <div sx={{ flex: "row", justify: "right", align: "center" }}>
              {eModes[user.userEmodeCategoryId] && (
                <div sx={{ flex: "row", align: "center", textAlign: "end" }}>
                  {user.userEmodeCategoryId !== 0 ? (
                    <span>
                      {eModes[user.userEmodeCategoryId].assets.join(", ")}
                    </span>
                  ) : (
                    <span>All Assets</span>
                  )}
                </div>
              )}
              {selectedEmode && (
                <>
                  <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                  <div
                    sx={{ flex: "row", align: "center", justify: "flex-end" }}
                  >
                    {selectedEmode?.id !== 0 ? (
                      <Text sx={{ textAlign: "end" }}>
                        {selectedEmode.assets.join(", ")}
                      </Text>
                    ) : (
                      <Text>
                        <span>All Assets</span>
                      </Text>
                    )}
                  </div>
                </>
              )}
            </div>
          </Row>
          <DetailsHFLine
            visibleHfChange={!!selectedEmode}
            healthFactor={user.healthFactor}
            futureHealthFactor={newSummary.healthFactor}
          />

          {showMaxLTVRow && (
            <Row
              caption={<span>Maximum loan to value</span>}
              captionColor="basic400"
              sx={{ mb: 12 }}
            >
              <div sx={{ textAlign: "right" }}>
                <div sx={{ flex: "row", align: "center", justify: "flex-end" }}>
                  <FormattedNumber
                    value={user.currentLoanToValue}
                    visibleDecimals={2}
                    compact
                    percent
                  />

                  {selectedEmode !== undefined && (
                    <>
                      <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                      <FormattedNumber
                        value={newSummary.currentLoanToValue}
                        visibleDecimals={2}
                        compact
                        percent
                      />
                    </>
                  )}
                </div>
              </div>
            </Row>
          )}
        </TxModalDetails>
      )}
      {(blockingError === ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING ||
        blockingError === ErrorType.CLOSE_POSITIONS_BEFORE_DISABLING) && (
        <Blocked />
      )}
      {txError && <GasEstimationError txError={txError} sx={{ mt: 12 }} />}
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          sx={{ mt: 12 }}
          networkName={networkConfig.name}
          chainId={currentChainId}
        />
      )}
      {user.userEmodeCategoryId === 0 && (
        <Alert variant="warning" sx={{ mt: 12 }}>
          <Text fs={13}>
            Enabling E-Mode only allows you to borrow assets belonging to the
            selected category.
          </Text>
        </Alert>
      )}
      {blockingError === ErrorType.EMODE_DISABLED_LIQUIDATION && <Blocked />}
      {showLiquidationRiskAlert && (
        <Alert variant="error" sx={{ mt: 24, align: "center" }}>
          <Text fs={13}>Liquidation risk</Text>
          <Text fs={13}>
            This action will reduce your health factor. Please be mindful of the
            increased risk of collateral liquidation.{" "}
          </Text>
        </Alert>
      )}
      <EmodeActions
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined || !selectedEmode}
        selectedEmode={disableMode ? 0 : selectedEmode?.id || 0}
        activeEmode={user.userEmodeCategoryId}
        eModes={eModes}
      />
    </>
  )
}
