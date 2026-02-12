import { ProtocolAction } from "@aave/contract-helpers"
import { useTransformEvmTxToExtrinsic } from "api/evm"
import { Button } from "components/Button/Button"
import { useShallow } from "hooks/useShallow"

import { ComputedUserReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { BigNumber as ethersBN } from "ethers"

import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"
import { useTranslation } from "react-i18next"
import { createToastMessages } from "state/toasts"
import { Alert } from "components/Alert/Alert"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"

type DisableCollaterasProps = {
  activeCollaterals: ComputedUserReserveData[]
  isBorrowedAssets: boolean
}

export const DisableCollaterasButton = ({
  activeCollaterals,
  isBorrowedAssets,
}: DisableCollaterasProps) => {
  const { t } = useTranslation()
  const { createBatch } = useCreateBatchTx()
  const [estimateGasLimit, setUsageAsCollateral] = useRootStore(
    useShallow((state) => [state.estimateGasLimit, state.setUsageAsCollateral]),
  )
  const transformTx = useTransformEvmTxToExtrinsic()
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()
  const { account } = useAccount()

  if (!activeCollaterals.length) return null

  const onClick = async () => {
    const isEvm = isEvmAccount(account?.address)

    const txs = await Promise.all(
      activeCollaterals.map(async (collateral) => {
        const collateralTxs = await setUsageAsCollateral({
          reserve: collateral.underlyingAsset,
          usageAsCollateral: false,
        })

        const params = await collateralTxs
          .find((tx) => "DLP_ACTION" === tx.txType)
          ?.tx()

        if (!params)
          throw new Error(
            `Disable collateral transaction not found for ${collateral.underlyingAsset}`,
          )

        const tx = await estimateGasLimit(
          {
            ...params,
            value: ethersBN.from("0"),
          },
          ProtocolAction.setUsageAsCollateral,
        )
        return transformTx(tx)
      }),
    )

    const toast = createToastMessages("lending.collateral.disableAll.toast", {
      t,
    })

    await createBatch(
      txs,
      {},
      {
        toast,
      },
      isEvm,
    )

    refetchPoolData && refetchPoolData()
    refetchGhoData && refetchGhoData()
    refetchIncentiveData && refetchIncentiveData()
  }

  return (
    <>
      <Alert variant="warning" sx={{ my: 16 }}>
        {isBorrowedAssets
          ? t("lending.supply.alert.borrowed")
          : t("lending.supply.alert.disable")}
      </Alert>

      <Button onClick={onClick} disabled={isBorrowedAssets}>
        {t("lending.supply.alert.cta")}
      </Button>
    </>
  )
}
