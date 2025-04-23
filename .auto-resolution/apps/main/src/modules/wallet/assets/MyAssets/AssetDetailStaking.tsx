import { StylizedAdd } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailStaking: FC<Props> = ({ asset }) => {
  const { t } = useTranslation("wallet")

  if (!asset.canStake) {
    return null
  }

  return (
    <Button
      type="button"
      variant="emphasis"
      outline
      iconStart={StylizedAdd}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {t("myAssets.actions.staking", {
        symbol: asset.symbol,
      })}
    </Button>
  )
}
