import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { NewDepositFormValues } from "./NewDepositForm.form"
import { FormProvider, useFormContext } from "react-hook-form"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { CurrentDepositData } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { NewDepositSummary } from "sections/wallet/strategy/NewDepositForm/NewDepositSummary"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { Modal } from "components/Modal/Modal"
import { NewDepositAssetSelector } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { noop } from "utils/helpers"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"

const assetsBlacklist = [GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID]

type Props = {
  readonly assetId: string
  readonly depositData: CurrentDepositData | null
}

export const NewDepositForm: FC<Props> = ({ assetId, depositData }) => {
  const { t } = useTranslation()
  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { account } = useAccount()

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const selectedAsset = form.watch("asset")
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const allowedAssets = useNewDepositAssets(assetsBlacklist)
  const { minAmountOut, submit } = useSubmitNewDepositForm(assetId)

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fw={[126, 600]} fs={[14, 17.5]} lh="1.2" color="white">
            {t("wallet.strategy.deposit.yourDeposit")}
          </Text>
          <NewDepositAssetField
            selectedAssetBalance={selectedAssetBalance}
            onSelectAssetClick={
              allowedAssets.length ? () => setIsAssetSelectOpen(true) : noop
            }
          />
          {account && (
            <Button type="submit" variant="primary">
              {depositData
                ? t("add")
                : t("wallet.strategy.gigadot.deposit.cta")}
            </Button>
          )}
          {!account && <Web3ConnectModalButton />}
          <NewDepositSummary
            asset={asset}
            minReceived={new BigNumber(minAmountOut || "0")
              .shiftedBy(-asset.decimals)
              .toString()}
          />
        </div>
      </form>
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
    </FormProvider>
  )
}
