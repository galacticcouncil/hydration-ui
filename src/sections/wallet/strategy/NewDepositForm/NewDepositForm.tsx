import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { NewDepositFormValues } from "./NewDepositForm.form"
import { useFormContext } from "react-hook-form"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { NewDepositSummary } from "sections/wallet/strategy/NewDepositForm/NewDepositSummary"
import { useAccountBalances } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { Modal } from "components/Modal/Modal"
import { NewDepositAssetSelector } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { noop } from "utils/helpers"
import { GETH_ERC20_ASSET_ID, STRATEGY_ASSETS_BLACKLIST } from "utils/constants"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"
import { Alert } from "components/Alert/Alert"
import { usePools, useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { PoolContext } from "sections/pools/pool/Pool"
import { TransferModal } from "sections/pools/stablepool/transfer/TransferModal"

type Props = {
  readonly assetId: string
}

export const NewDepositForm: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation()
  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { account } = useAccount()

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountBalances()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const selectedAsset = form.watch("asset")
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const allowedAssets = useNewDepositAssets(STRATEGY_ASSETS_BLACKLIST)
  const { minAmountOut, submit, supplyCapReached } =
    useSubmitNewDepositForm(assetId)

  const isGETH = assetId === GETH_ERC20_ASSET_ID

  return (
    <>
      <div sx={{ flex: "column", gap: 10 }}>
        <form
          onSubmit={!isGETH ? form.handleSubmit(submit) : undefined}
          sx={{ flex: "column", gap: 10 }}
        >
          <Text fw={[126, 600]} fs={[14, 17.5]} lh="1.2" color="white">
            {t("wallet.strategy.deposit.yourDeposit")}
          </Text>
          <NewDepositAssetField
            selectedAssetBalance={selectedAssetBalance}
            onSelectAssetClick={
              allowedAssets.length ? () => setIsAssetSelectOpen(true) : noop
            }
          />
          {account && !isGETH ? (
            <Button type="submit" variant="primary" disabled={supplyCapReached}>
              {t("wallet.strategy.deposit.cta", {
                symbol: asset.symbol,
              })}
            </Button>
          ) : null}
          {!account && <Web3ConnectModalButton />}
        </form>

        {isGETH && account && (
          <GETHDepositButton
            assetId={assetId}
            symbol={asset.symbol}
            disabled={supplyCapReached}
            initialAssetId={selectedAsset?.id}
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
  symbol,
  disabled,
  initialAmount,
  initialAssetId,
}: {
  assetId: string
  symbol: string
  disabled: boolean
  initialAssetId?: string
  initialAmount?: string
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const { data } = usePools()

  const pool = data?.find((pool) => pool.id === assetId)

  const stablepoolDetails = useStableSwapReserves(pool?.poolId ?? "")

  return (
    <>
      <Button
        type="button"
        variant="primary"
        disabled={disabled || !pool}
        onClick={() => setOpen(true)}
      >
        {t("wallet.strategy.deposit.cta", {
          symbol,
        })}
      </Button>
      {pool && open && (
        <PoolContext.Provider
          value={{
            pool: { ...pool, ...stablepoolDetails.data },
            isXYK: false,
          }}
        >
          <TransferModal
            onClose={() => setOpen(false)}
            farms={pool.farms}
            initialAmount={initialAmount}
            initialAssetId={initialAssetId}
            skipOptions
          />
        </PoolContext.Provider>
      )}
    </>
  )
}
