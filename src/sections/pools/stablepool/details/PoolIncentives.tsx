import { u32 } from "@polkadot/types"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SIncentivesContainer } from "./PoolIncentives.styled"
import { BN_1, BN_10 } from "utils/constants"
import { FarmIncentive } from "sections/pools/components/FarmIncentive"

type Props = {
  poolId: u32
  className?: string
}

export const PoolIncentives = ({ className }: Props) => {
  const { t } = useTranslation()

  return (
    <SIncentivesContainer className={className}>
      <Text fs={13} color="basic400">
        {t("liquidity.stablepool.asset.incentives.title")}
      </Text>
      <Spacer size={[10, 27]} />
      <div>
        <FarmIncentive
          apr={t("value.APR.range", { from: BN_1, to: BN_10 })}
          symbol="HDX"
        />
        <FarmIncentive
          apr={t("value.APR.range", { from: BN_1, to: BN_10 })}
          symbol="DAI"
        />
        <FarmIncentive
          apr={t("value.APR.range", { from: BN_1, to: BN_10 })}
          symbol="LRNA"
        />
      </div>
    </SIncentivesContainer>
  )
}
