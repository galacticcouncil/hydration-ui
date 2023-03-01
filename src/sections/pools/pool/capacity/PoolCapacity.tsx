import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { SBar, SBarContainer, SContainer } from "./PoolCapacity.styled"
import { usePoolCapacity } from "sections/pools/pool/capacity/PoolCapacity.utils"
import { useMeasure } from "react-use"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"

type Props = { pool: OmnipoolPool; className?: string }

export const PoolCapacity = ({ pool, className }: Props) => {
  const capacity = usePoolCapacity(pool)
  const [ref, { width }] = useMeasure<HTMLDivElement>()

  if (capacity.isLoading || !capacity.data) return null

  const isError = capacity.data.capacity.isNaN()
  const filled = isError ? "0" : capacity.data.filledPercent.toFixed(2)

  return (
    <SContainer ref={ref} className={className}>
      <Separator sx={{ mb: 15, display: ["none", "inherit"] }} />
      <div sx={{ flex: ["column-reverse", "column"] }}>
        {!isError && (
          <div>
            <Trans
              i18nKey="liquidity.asset.capacity"
              tOptions={{
                symbol: capacity.data.symbol,
                filled: capacity.data.filled,
                capacity: capacity.data.capacity,
              }}
            >
              <Text fs={11} fw={500} color="basic400" as="span" />
              <Text fs={11} fw={500} color="brightBlue100" as="span" />
            </Trans>
          </div>
        )}
        <SBarContainer>
          <SBar filled={filled} width={width} />
        </SBarContainer>
      </div>
    </SContainer>
  )
}
