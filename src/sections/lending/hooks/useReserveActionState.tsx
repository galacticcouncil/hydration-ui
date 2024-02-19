import { Stack } from "@mui/material"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { WalletEmptyInfo } from "sections/lending/modules/dashboard/lists/SupplyAssetsList/WalletEmptyInfo"
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
  const { user, eModes } = useAppDataContext()
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps()
  const [currentMarket, currentNetworkConfig, currentChainId, displayGho] =
    useRootStore((store) => [
      store.currentMarket,
      store.currentNetworkConfig,
      store.currentChainId,
      store.displayGho,
    ])

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
      <Stack gap={3}>
        {balance === "0" && !isGho && (
          <>
            {currentNetworkConfig.isTestnet ? (
              <Warning sx={{ mb: 0 }} variant="info">
                <span>
                  Your {networkName} wallet is empty. Get free test{" "}
                  {reserve.name} at{" "}
                  <a
                    target="_blank"
                    href={ROUTES.faucet}
                    css={{ textDecoration: "underline" }}
                    rel="noreferrer"
                  >
                    <span>{networkName} Faucet</span>
                  </a>
                </span>
              </Warning>
            ) : (
              <WalletEmptyInfo
                sx={{ mb: 0 }}
                name={networkName}
                bridge={bridge}
                chainId={currentChainId}
              />
            )}
          </>
        )}

        {(balance !== "0" || isGho) &&
          user?.totalCollateralMarketReferenceCurrency === "0" && (
            <Warning sx={{ mb: 0 }} variant="info">
              <span>
                To borrow you need to supply any asset to be used as collateral.
              </span>
            </Warning>
          )}

        {isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} variant="warning">
            <span>Collateral usage is limited because of Isolation mode.</span>
          </Warning>
        )}

        {eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} variant="info">
            <span>
              Borrowing is unavailable because you’ve enabled Efficiency Mode
              (E-Mode) and Isolation mode. To manage E-Mode and Isolation mode
              visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </span>
          </Warning>
        )}

        {eModeBorrowDisabled && !isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} variant="info">
            <span>
              Borrowing is unavailable because you’ve enabled Efficiency Mode
              (E-Mode) for{" "}
              {getEmodeMessage(eModes[user.userEmodeCategoryId].label)}{" "}
              category. To manage E-Mode categories visit your{" "}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </span>
          </Warning>
        )}

        {!eModeBorrowDisabled && isolationModeBorrowDisabled && (
          <Warning sx={{ mb: 0 }} variant="info">
            <span>
              Borrowing is unavailable because you’re using Isolation mode. To
              manage Isolation mode visit your{" "}
              <Link href={ROUTES.dashboard}>Dashboard</Link>.
            </span>
          </Warning>
        )}

        {maxAmountToSupply === "0" &&
          supplyCap?.determineWarningDisplay({
            supplyCap,
            icon: false,
            sx: { mb: 0 },
          })}
        {maxAmountToBorrow === "0" &&
          borrowCap?.determineWarningDisplay({
            borrowCap,
            icon: false,
            sx: { mb: 0 },
          })}
        {reserve.isIsolated &&
          balance !== "0" &&
          user?.totalCollateralUSD !== "0" &&
          debtCeiling?.determineWarningDisplay({
            debtCeiling,
            icon: false,
            sx: { mb: 0 },
          })}
      </Stack>
    ),
  }
}
