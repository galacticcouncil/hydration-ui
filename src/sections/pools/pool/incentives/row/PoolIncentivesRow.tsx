import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useAsset } from "api/asset"
import BN from "bignumber.js"
import { u32 } from "@polkadot/types-codec"
import { useTranslation } from "react-i18next"
import { SContainer } from "sections/pools/pool/incentives/PoolIncentives.styled"

type Props = {
  assetId: u32
  apr: BN
}

export const PoolIncentivesRow: FC<Props> = ({ assetId, apr }) => {
  const { t } = useTranslation()
  const asset = useAsset(assetId)

  return (
    <SContainer>
      <Icon icon={asset.data?.icon} sx={{ mr: 10 }} size={28} />
      <Text color="white" fw={500}>
        {asset.data?.name}
      </Text>
      <Text fw={500} color="primary200" sx={{ ml: "auto" }}>
        {t("value.APR", { apr })}
      </Text>
    </SContainer>
  )
}
