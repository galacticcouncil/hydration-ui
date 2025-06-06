import { Alert } from "@galacticcouncil/ui/components"

import { getEmodeMessage } from "@/components/transactions/emode/emode.utils"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useAssetCaps } from "@/hooks/useAssetCaps"
import { useRootStore } from "@/store/root"
import { assetCanBeBorrowedByUser } from "@/utils/getMaxAmountAvailableToBorrow"

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
  const [currentMarket, displayGho] = useRootStore((store) => [
    store.currentMarket,
    store.displayGho,
  ])

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
    alerts: [
      balance === "0" && !isGho && (
        <Alert
          key="empty-wallet"
          variant="info"
          description="Your wallet is empty. Purchase or transfer assets."
        />
      ),

      (balance !== "0" || isGho) &&
        user?.totalCollateralMarketReferenceCurrency === "0" && (
          <Alert
            key="supply-collateral"
            variant="info"
            description="To borrow you need to supply an asset to be used as collateral."
          />
        ),

      isolationModeBorrowDisabled && (
        <Alert
          key="isolation-warning"
          variant="warning"
          description="Collateral usage is limited because of Isolation mode."
        />
      ),

      eModeBorrowDisabled && isolationModeBorrowDisabled && (
        <Alert
          key="emode-and-isolation"
          variant="info"
          description="Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) and Isolation mode. To manage E-Mode and Isolation mode visit your Dashboard."
        />
      ),

      eModeBorrowDisabled && !isolationModeBorrowDisabled && (
        <Alert
          key="emode-category"
          variant="info"
          description={`Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) for ${getEmodeMessage(
            eModes[user.userEmodeCategoryId].label,
          )} category. To manage E-Mode categories visit your Dashboard`}
        />
      ),

      !eModeBorrowDisabled && isolationModeBorrowDisabled && (
        <Alert
          key="isolation-only"
          variant="info"
          description="Borrowing is unavailable because you’re using Isolation mode. To manage Isolation mode visit your Dashboard"
        />
      ),

      maxAmountToSupply === "0" &&
        supplyCap?.determineWarningDisplay({
          supplyCap,
          icon: false,
        }),

      maxAmountToBorrow === "0" &&
        borrowCap?.determineWarningDisplay({
          borrowCap,
          icon: false,
        }),

      reserve.isIsolated &&
        balance !== "0" &&
        user?.totalCollateralUSD !== "0" &&
        debtCeiling?.determineWarningDisplay({
          debtCeiling,
          icon: false,
        }),
    ].filter(Boolean),
  }
}
