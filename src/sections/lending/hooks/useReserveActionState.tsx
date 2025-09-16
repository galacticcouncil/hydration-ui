import { ChainId } from "@aave/contract-helpers"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"
import { useShallow } from "hooks/useShallow"
import { useTranslation } from "react-i18next"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useRootStore } from "sections/lending/store/root"
import { assetCanBeBorrowedByUser } from "sections/lending/utils/getMaxAmountAvailableToBorrow"

interface ReserveActionStateProps {
  balance: string
  maxAmountToSupply: string
  maxAmountToBorrow: string
  reserve: ComputedReserveData
}

export const useReserveActionState = ({
  balance,
  maxAmountToSupply,
  maxAmountToBorrow,
  reserve,
}: ReserveActionStateProps) => {
  const { t } = useTranslation()
  const { user, eModes } = useAppDataContext()
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps()
  const [currentMarket, currentNetworkConfig, currentChainId, displayGho] =
    useRootStore(
      useShallow((store) => [
        store.currentMarket,
        store.currentNetworkConfig,
        store.currentChainId,
        store.displayGho,
      ]),
    )

  const { bridge, name: networkName } = currentNetworkConfig

  const assetCanBeBorrowedFromPool = assetCanBeBorrowedByUser(reserve, user)
  const userHasNoCollateralSupplied =
    user?.totalCollateralMarketReferenceCurrency === "0"
  const isolationModeBorrowDisabled =
    user?.isInIsolationMode && !reserve.borrowableInIsolation
  const eModeBorrowDisabled =
    user?.isInEmode && reserve.eModeCategoryId !== user.userEmodeCategoryId

  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

  return {
    disableSupplyButton: balance === "0" || maxAmountToSupply === "0" || isGho,
    disableBorrowButton:
      !assetCanBeBorrowedFromPool ||
      userHasNoCollateralSupplied ||
      isolationModeBorrowDisabled ||
      eModeBorrowDisabled ||
      maxAmountToBorrow === "0",
    alerts: (
      <>
        {balance === "0" && !isGho && (
          <Alert sx={{ mt: 12 }} variant="info">
            {bridge ? (
              <Text fs={14}>
                Your {networkName} wallet is empty. Purchase or transfer assets
                or use {<Link href={bridge.url}>{bridge.name}</Link>} to
                transfer your{" "}
                {[ChainId.avalanche].includes(currentChainId)
                  ? "Ethereum & Bitcoin"
                  : "Ethereum"}{" "}
                assets.
              </Text>
            ) : (
              <Text fs={14}>
                Your {networkName} wallet is empty. Purchase or transfer assets.
              </Text>
            )}
          </Alert>
        )}

        {(balance !== "0" || isGho) &&
          user?.totalCollateralMarketReferenceCurrency === "0" && (
            <Alert sx={{ mt: 12 }} variant="info">
              <Text fs={14}>{t("lending.borrow.table.alert")}</Text>
            </Alert>
          )}

        {isolationModeBorrowDisabled && (
          <Alert sx={{ mt: 12 }} variant="warning">
            <Text fs={14}>
              Collateral usage is limited because of Isolation mode.
            </Text>
          </Alert>
        )}

        {eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Alert sx={{ mt: 12 }} variant="info">
            <Text fs={14}>
              Borrowing is unavailable because you’ve enabled Efficiency Mode
              (E-Mode) and Isolation mode. To manage E-Mode and Isolation mode
              visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Text>
          </Alert>
        )}

        {eModeBorrowDisabled && !isolationModeBorrowDisabled && (
          <Alert sx={{ mt: 12 }} variant="info">
            <Text fs={14}>
              Borrowing is unavailable because you’ve enabled Efficiency Mode
              (E-Mode) for{" "}
              {getEmodeMessage(eModes[user.userEmodeCategoryId].label)}{" "}
              category. To manage E-Mode categories visit your{" "}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Text>
          </Alert>
        )}

        {!eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Alert sx={{ mt: 12 }} variant="info">
            <Text fs={14}>
              Borrowing is unavailable because you’re using Isolation mode. To
              manage Isolation mode visit your{" "}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </Text>
          </Alert>
        )}

        {maxAmountToSupply === "0" && (
          <div sx={{ mt: 12 }}>
            {supplyCap?.determineWarningDisplay({
              supplyCap,
              icon: false,
            })}
          </div>
        )}
        {maxAmountToBorrow === "0" && (
          <div sx={{ mt: 12 }}>
            {borrowCap?.determineWarningDisplay({
              borrowCap,
              icon: false,
            })}
          </div>
        )}
        {reserve.isIsolated &&
          balance !== "0" &&
          user?.totalCollateralUSD !== "0" && (
            <div sx={{ mt: 12 }}>
              {debtCeiling?.determineWarningDisplay({
                debtCeiling,
                icon: false,
              })}
            </div>
          )}
      </>
    ),
  }
}
