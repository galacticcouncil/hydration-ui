import { FC } from "react"
import {
  SContainer,
  SIcon,
} from "sections/pools/pool/position/list/PoolPositionList.styled"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import { ReactComponent as FarmIcon } from "assets/icons/FarmIcon.svg"
import { PoolPosition } from "sections/pools/pool/position/PoolPosition"
import { PoolBase } from "@galacticcouncil/sdk"
import { DepositNftType } from "api/deposits"

type Props = {
  index: number
  depositNft: DepositNftType
  pool: PoolBase
}

export const PoolPositionList: FC<Props> = ({ depositNft, index, pool }) => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <SIcon>
        <FarmIcon />
      </SIcon>
      <div sx={{ flex: "column", gap: 12 }}>
        <div>
          <GradientText fs={16} lh={22} fw={500}>
            {t("pools.pool.positions.title", { index })}
          </GradientText>
        </div>
        {depositNft.deposit.yieldFarmEntries.map((entry, i) => (
          <PoolPosition
            key={i}
            index={i + 1}
            pool={pool}
            position={entry}
            shares={depositNft.deposit.shares.toBigNumber()}
          />
        ))}
      </div>
    </SContainer>
  )
}
