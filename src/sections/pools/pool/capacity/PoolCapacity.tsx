import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SBar, SBarContainer, SContainer } from "./PoolCapacity.styled"
import { usePoolCapacity } from "sections/pools/pool/capacity/PoolCapacity.utils"
import { useMeasure } from "react-use"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

type Props = { pool: OmnipoolPool }

export const PoolCapacity = ({ pool }: Props) => {
  const capacity = usePoolCapacity(pool)
  const [ref, { width }] = useMeasure<HTMLDivElement>()

  if (capacity.isLoading || !capacity.data) return null

  return (
    <SContainer ref={ref}>
      <Trans
        i18nKey="pools.pool.capacity"
        tOptions={{
          symbol: capacity.data.symbol,
          filled: capacity.data.filled,
          capacity: capacity.data.capacity,
        }}
      >
        <Text fs={11} fw={500} color="basic400" as="span" />
        <Text fs={11} fw={500} color="brightBlue100" as="span" />
      </Trans>

      <SBarContainer>
        <SBar
          filled={capacity.data?.filledPercent?.toFixed(2) ?? "0"}
          width={width}
        />
      </SBarContainer>
    </SContainer>
  )
}
