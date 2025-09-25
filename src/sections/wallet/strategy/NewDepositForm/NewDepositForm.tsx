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
import { GETH_ERC20_ASSET_ID } from "utils/constants"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"
import { Alert } from "components/Alert/Alert"
import { TransferModal } from "sections/pools/stablepool/transfer/TransferModal"
import { useOmnipoolFarm } from "api/farms"

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
            poolId={getErc20(assetId)?.underlyingAssetId ?? assetId}
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
        {t("wallet.strategy.deposit.cta", {
          symbol,
        })}
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
