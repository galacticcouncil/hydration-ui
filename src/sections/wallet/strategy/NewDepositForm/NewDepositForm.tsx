import { FC, useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { NewDepositFormValues } from "./NewDepositForm.form"
import { useFormContext } from "react-hook-form"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { NewDepositSummary } from "sections/wallet/strategy/NewDepositForm/NewDepositSummary"
import { useAccountBalances } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import {
  useAccount,
  useEvmAccount,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { Modal } from "components/Modal/Modal"
import { NewDepositAssetSelector } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { noop } from "utils/helpers"
import { GETH_ERC20_ASSET_ID, PRIME_ERC20_ASSET_ID } from "utils/constants"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"
import { Alert } from "components/Alert/Alert"
import { TransferModal } from "sections/pools/stablepool/transfer/TransferModal"
import { useOmnipoolFarm } from "api/farms"
import {
  DEFAULT_NULL_VALUE_ON_TX,
  ProtocolAction,
  transactionType,
} from "@aave/contract-helpers"
import {
  useBorrowDisableCollateralTxs,
  useBorrowGasEstimation,
  useBorrowPoolContract,
  useBorrowUserReserves,
} from "api/borrow"

import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useMutation } from "@tanstack/react-query"
import { createToastMessages } from "state/toasts"
import { BigNumber as ethersBN } from "ethers"
import { ISubmittableResult } from "@polkadot/types/types"
import { PRIME_ASSET_ADDRESS } from "sections/lending/ui-config/misc"
import { useCreateBatchTx } from "sections/transaction/ReviewTransaction.utils"
import { useTransformEvmTxToExtrinsic } from "api/evm"
import { isEvmAccount } from "utils/evm"

type Props = {
  readonly assetId: string
}

export const NewDepositForm: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation()
  const { getErc20, native } = useAssets()
  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { account } = useAccount()

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountBalances()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const selectedAsset = form.watch("asset")
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.transferable || "0"

  const allowedAssets = useNewDepositAssets(
    getErc20(assetId)?.underlyingAssetId ?? "",
    {
      blacklist: assetId === GETH_ERC20_ASSET_ID ? [] : [assetId],
      lowPriorityAssetIds: [native.id],
    },
  )

  const { minAmountOut, submit, supplyCapReached, getSwapTx } =
    useSubmitNewDepositForm(assetId)

  const isGETH = assetId === GETH_ERC20_ASSET_ID
  const isPrime = assetId === PRIME_ERC20_ASSET_ID

  return (
    <>
      <div sx={{ flex: "column", gap: 10 }}>
        <form
          onSubmit={!isGETH ? form.handleSubmit(submit) : undefined}
          sx={{ flex: "column", gap: 10 }}
        >
          <Text fw={500} fs={[14, 18]} lh="1.2" color="white" font="GeistMono">
            {t("wallet.strategy.deposit.joinStrategy", {
              symbol: asset.symbol,
            })}
          </Text>
          <NewDepositAssetField
            selectedAssetBalance={selectedAssetBalance}
            onSelectAssetClick={
              allowedAssets.length ? () => setIsAssetSelectOpen(true) : noop
            }
          />
          {account && !isGETH && !isPrime ? (
            <Button type="submit" variant="primary" disabled={supplyCapReached}>
              {t("joinStrategy")}
            </Button>
          ) : null}
          {!account && <Web3ConnectModalButton />}
        </form>

        {isGETH && account && (
          <GETHDepositButton
            assetId={assetId}
            poolId={getErc20(assetId)?.underlyingAssetId ?? assetId}
            symbol={asset.symbol}
            disabled={supplyCapReached}
            initialAssetId={selectedAsset?.id}
            initialAmount={form.watch("amount")}
          />
        )}
        {isPrime && account && (
          <PrimeDepositButton
            getSwapTx={getSwapTx}
            initialAmount={form.watch("amount")}
          />
        )}
        {supplyCapReached ? (
          <Alert variant="warning">
            {t("lending.tooltip.supplyCapMaxed", {
              symbol: asset.symbol,
            })}
          </Alert>
        ) : (
          <NewDepositSummary
            asset={asset}
            minReceived={new BigNumber(minAmountOut || "0")
              .shiftedBy(-asset.decimals)
              .toString()}
          />
        )}
      </div>
      <Modal
        open={isAssetSelectOpen}
        onClose={() => setIsAssetSelectOpen(false)}
        title={t("selectAsset.title")}
        noPadding
      >
        <NewDepositAssetSelector
          allowedAssets={allowedAssets}
          onClose={() => setIsAssetSelectOpen(false)}
        />
      </Modal>
    </>
  )
}

export const GETHDepositButton = ({
  assetId,
  poolId,
  symbol,
  disabled,
  initialAmount,
  initialAssetId,
}: {
  assetId: string
  poolId: string
  symbol: string
  disabled: boolean
  initialAssetId?: string
  initialAmount?: string
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { data: omnipoolFarm } = useOmnipoolFarm(GETH_ERC20_ASSET_ID)

  return (
    <>
      <Button
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {t("joinStrategy")}
      </Button>
      {open && (
        <TransferModal
          poolId={poolId}
          stablepoolAssetId={assetId}
          onClose={() => setOpen(false)}
          initialAmount={initialAmount}
          initialAssetId={initialAssetId}
          farms={omnipoolFarm?.farms ?? []}
          skipOptions
        />
      )}
    </>
  )
}

const PrimeDepositButton = ({
  getSwapTx,
  initialAmount,
}: {
  getSwapTx: () => Promise<
    SubmittableExtrinsic<"promise", ISubmittableResult> | undefined
  >
  initialAmount?: string
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { account: evmAccount } = useEvmAccount()
  const { createBatch } = useCreateBatchTx()

  const getActiveCollateralsTxs = useBorrowDisableCollateralTxs()
  const { mutateAsync: estimateGasLimit } = useBorrowGasEstimation()
  const { data: userReserves } = useBorrowUserReserves()
  const transformTx = useTransformEvmTxToExtrinsic()
  const poolContract = useBorrowPoolContract()

  const {
    isActiveCollaterals,
    isBlockedByBorrowedAssets,
    isPrimeAssetCollateral,
  } = useMemo(() => {
    const isBorrowedAsset = userReserves?.userReserves.some(
      (reserve) => reserve.scaledVariableDebt !== "0",
    )

    const activeCollaterals = userReserves?.userReserves.filter(
      (reserve) => reserve.usageAsCollateralEnabledOnUser,
    )

    const isActiveCollaterals = !!activeCollaterals?.length

    const isPrimeAssetCollateral = activeCollaterals?.some(
      (reserve) => reserve.underlyingAsset === PRIME_ASSET_ADDRESS,
    )

    const isBlockedByBorrowedAssets = isBorrowedAsset
      ? !isPrimeAssetCollateral
      : false

    return {
      activeCollaterals,
      isBlockedByBorrowedAssets,
      isActiveCollaterals,
      isPrimeAssetCollateral,
    }
  }, [userReserves?.userReserves])

  const { mutateAsync: createPrimeDepositTx } = useMutation({
    mutationFn: async () => {
      if (!poolContract) throw new Error("Pool contract not found")
      if (!evmAccount) throw new Error("EVM account not found")

      const swapTx = await getSwapTx?.()

      if (!swapTx) throw new Error("Swap transaction not found")

      const collateralTxs = await getActiveCollateralsTxs?.()

      if (!collateralTxs) throw new Error("collateralTxs not found")

      const isEvm = isEvmAccount(account?.address)

      const contractInstance = poolContract.getContractInstance(
        poolContract.poolAddress,
      )

      const txRaw =
        await contractInstance.populateTransaction.setUserUseReserveAsCollateral(
          PRIME_ASSET_ADDRESS,
          true,
        )

      const enableCollateralTxRaw: transactionType = {
        ...txRaw,
        from: evmAccount.address,
        value: DEFAULT_NULL_VALUE_ON_TX,
      }

      const enableCollateralTx = await estimateGasLimit({
        tx: {
          ...enableCollateralTxRaw,
          value: ethersBN.from("0"),
        },
        action: ProtocolAction.setUsageAsCollateral,
      })

      const toast = createToastMessages(
        "lending.supplyAndEnableCollateral.toast",
        {
          t,
          tOptions: {
            value: initialAmount ?? "",
            symbol: "PRIME",
          },
          components: ["span.highlight"],
        },
      )

      const txs = [swapTx]

      if (isActiveCollaterals && !isPrimeAssetCollateral) {
        txs.push(...collateralTxs)
      }

      if (!isPrimeAssetCollateral) {
        txs.push(transformTx(enableCollateralTx))
      }

      await createBatch(txs, {}, { toast }, isEvm)
    },
  })

  return (
    <>
      {isBlockedByBorrowedAssets && (
        <Alert variant="warning" sx={{ my: 16 }}>
          <Text fs={12} lh={16} fw={500}>
            <Trans
              t={t}
              i18nKey="lending.supply.alert.borrowed"
              tOptions={{ symbol: "PRIME" }}
            />
          </Text>
        </Alert>
      )}
      {isActiveCollaterals &&
        !isBlockedByBorrowedAssets &&
        !isPrimeAssetCollateral && (
          <Alert variant="warning" sx={{ my: 16 }}>
            {t("lending.supply.alert.isolated", { symbol: "PRIME" })}
          </Alert>
        )}

      <Button
        type="button"
        variant="primary"
        disabled={isBlockedByBorrowedAssets}
        onClick={() => createPrimeDepositTx()}
      >
        {t("joinStrategy")}
      </Button>
    </>
  )
}
