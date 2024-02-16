import { InterestRate } from "@aave/contract-helpers"

import { Box, Button } from "@mui/material"
import { useCallback } from "react"
import { useCurrentTimestamp } from "sections/lending/hooks/useCurrentTimestamp"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import {
  selectSelectedBorrowReservesForMigrationV3,
  selectedUserSupplyReservesForMigration,
} from "sections/lending/store/v3MigrationSelectors"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import { TxModalDetails } from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { TxModalTitle } from "sections/lending/components/transactions/FlowCommons/TxModalTitle"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { MigrateV3Actions } from "./MigrateV3Actions"
import { MigrateV3ModalAssetsList } from "./MigrateV3ModalAssetsList"

export const MigrateV3ModalContent = () => {
  const currentTimeStamp = useCurrentTimestamp(10)

  const { supplyPositions, borrowPositions } = useRootStore(
    useCallback(
      (state) => ({
        supplyPositions: selectedUserSupplyReservesForMigration(
          state,
          currentTimeStamp,
        ),
        borrowPositions: selectSelectedBorrowReservesForMigrationV3(
          state,
          currentTimeStamp,
        ),
      }),
      [currentTimeStamp],
    ),
  )

  const { gasLimit, mainTxState: migrateTxState, txError } = useModalContext()
  const { currentChainId } = useProtocolDataContext()
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context()
  const networkConfig = getNetworkConfig(currentChainId)

  const supplyAssets = supplyPositions.map((supplyAsset) => {
    return {
      underlyingAsset: supplyAsset.underlyingAsset,
      iconSymbol: supplyAsset.reserve.iconSymbol,
      symbol: supplyAsset.reserve.symbol,
      amount: supplyAsset.underlyingBalance,
      amountInUSD: supplyAsset.underlyingBalanceUSD,
    }
  })

  const borrowsAssets = borrowPositions.map((asset) => {
    return {
      underlyingAsset: asset.debtKey,
      iconSymbol: asset.reserve.iconSymbol,
      symbol: asset.reserve.symbol,
      amount:
        asset.interestRate === InterestRate.Stable
          ? asset.stableBorrows
          : asset.variableBorrows,
      amountInUSD:
        asset.interestRate === InterestRate.Stable
          ? asset.stableBorrowsUSD
          : asset.variableBorrowsUSD,
    }
  })

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />
  }

  const handleRoute = () => {
    /* 
TO-DO: re-enable in merge
if (currentMarket === CustomMarket.proto_polygon) {
      setCurrentMarket('proto_polygon_v3' as CustomMarket);
      window.location.href = `/?marketName=${CustomMarket.proto_polygon_v3}`;
    } else if (currentMarket === CustomMarket.proto_avalanche) {
      setCurrentMarket('proto_avalanche_v3' as CustomMarket);
      window.location.href = `/?marketName=${CustomMarket.proto_avalanche_v3}`;
    } else {
      setCurrentMarket('proto_mainnet_v3' as CustomMarket);
      window.location.href = `/?marketName=${CustomMarket.proto_mainnet_v3}`;
    } */
  }

  if (migrateTxState.success) {
    return (
      <TxSuccessView
        customAction={
          <Box mt={5}>
            <Button variant="gradient" size="medium" onClick={handleRoute}>
              <span>Go to V3 Dashboard</span>
            </Button>
          </Box>
        }
        customText={
          <span>
            Selected assets have successfully migrated. Visit the Market
            Dashboard to see them.
          </span>
        }
        action={<span>Migrated</span>}
      />
    )
  }

  return (
    <>
      <TxModalTitle title="Migrate to V3" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={currentChainId}
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <MigrateV3ModalAssetsList
          caption={<span>Selected supply assets</span>}
          assets={supplyAssets}
        />
        <MigrateV3ModalAssetsList
          caption={<span>Selected borrow assets</span>}
          assets={borrowsAssets}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <MigrateV3Actions isWrongNetwork={isWrongNetwork} blocked={false} />
    </>
  )
}
