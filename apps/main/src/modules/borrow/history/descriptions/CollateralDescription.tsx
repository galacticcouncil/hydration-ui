import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string | null | undefined
  readonly enabled: boolean
}

export const CollateralDescription: FC<Props> = ({ assetId, enabled }) => {
  const { t } = useTranslation(["borrow"])
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId ?? "")

  return (
    <Flex
      gap="s"
      align="center"
      justify={["end", "start"]}
      sx={{ flexWrap: "wrap" }}
    >
      <Text>
        <Trans
          t={t}
          i18nKey="borrow:history.table.collateralization"
          values={{ state: enabled ? "Enabled" : "Disabled" }}
        >
          <Text
            as="span"
            color={getToken(
              enabled ? "accents.success.emphasis" : "accents.danger.emphasis",
            )}
          />
        </Trans>
      </Text>
      <Flex align="center" gap="s">
        {assetId && <AssetLogo size="small" id={assetId} />} {asset.symbol}
      </Flex>
    </Flex>
  )
}
