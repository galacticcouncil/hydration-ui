import { Separator, Text } from "@galacticcouncil/ui/components"
import { FC, Fragment } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"
import { ChainAssetAmount } from "@/modules/wallet/assets/Withdraw/on-chain/ChainAssetAmount"
import {
  SChainAssetsList,
  SChainAssetsListContainer,
  SChainAssetsListHeader,
  SChainAssetsListItem,
} from "@/modules/wallet/assets/Withdraw/on-chain/ChainAssetsList.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"

type Props = {
  readonly search: string
  readonly onSelect: () => void
}

export const ChainAssetsList: FC<Props> = ({ search, onSelect }) => {
  const { t } = useTranslation()

  const { getAssetWithFallback } = useAssets()
  const { getBalance } = useAccountBalances()

  const { formState, watch, setValue } =
    useFormContext<AssetWithdrawFormValues>()
  const chain = watch("chain")

  const assetIds = chain === "Hydration" ? ["10", "5"] : ["5", "10"]
  const assets = assetIds.map((assetId) => getAssetWithFallback(assetId))

  const filteredAssets = assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
      asset.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <SChainAssetsListContainer>
      <SChainAssetsListHeader>
        <Text fs="p5" lh={1.2}>
          {t("asset")}
        </Text>
        <Text fw={500} fs="p5" lh={1.2} align="right">
          {t("balance")}
        </Text>
      </SChainAssetsListHeader>
      <SChainAssetsList>
        {filteredAssets.map((asset, index) => {
          const balance = getBalance(asset.id)

          return (
            <Fragment key={asset.id}>
              <SChainAssetsListItem
                onClick={() => {
                  setValue("asset", asset, {
                    shouldValidate: formState.isSubmitted,
                  })
                  onSelect()
                }}
              >
                <AssetLabelFull asset={asset} />
                <ChainAssetAmount
                  assetId={asset.id}
                  balance={String(balance?.total ?? 0n)}
                />
              </SChainAssetsListItem>
              {index < filteredAssets.length - 1 && (
                <Separator
                  sx={{
                    gridColumn: "1 / -1",
                    mx: "calc(var(--chain-assets-padding-inline) * -1)",
                  }}
                />
              )}
            </Fragment>
          )
        })}
      </SChainAssetsList>
    </SChainAssetsListContainer>
  )
}
