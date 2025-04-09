import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Modal } from "components/Modal/Modal"
import { FC, useMemo, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { prop } from "utils/rx"

type Props = {
  readonly selectedAssetBalance: string
}

export const NewDepositAssetField: FC<Props> = ({ selectedAssetBalance }) => {
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<NewDepositFormValues>()

  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { field: assetField, fieldState: assetFieldState } = useController({
    control,
    name: "asset",
  })

  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: "amount",
  })

  const { account } = useAccount()
  const { data: accountAssets } = useAccountAssets()

  const allowedAssets = useMemo<string[]>(() => {
    return account && accountAssets?.balances
      ? accountAssets.balances
          .map(prop("assetId"))
          .filter(
            (id) =>
              ![GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID].includes(id),
          )
      : []
  }, [account, accountAssets?.balances])

  return (
    <>
      <AssetSelect
        name={amountField.name}
        value={amountField.value}
        id={assetField.value?.id ?? ""}
        error={
          assetFieldState.error?.message ?? amountFieldState.error?.message
        }
        title={t("wallet.strategy.deposit.depositAsset")}
        onChange={amountField.onChange}
        balance={new BigNumber(selectedAssetBalance)}
        balanceLabel={t("balance")}
        onSelectAssetClick={
          allowedAssets.length ? () => setIsAssetSelectOpen(true) : undefined
        }
      />
      <Modal
        open={isAssetSelectOpen}
        onClose={() => setIsAssetSelectOpen(false)}
        title={t("selectAsset.title")}
        noPadding
      >
        <AssetsModalContent
          allowedAssets={allowedAssets}
          allAssets
          hideInactiveAssets
          onSelect={(asset) => {
            setValue("asset", asset, { shouldValidate: true })
            setIsAssetSelectOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
