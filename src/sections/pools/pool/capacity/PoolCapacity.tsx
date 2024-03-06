import { SBar, SBarContainer, SContainer } from "./PoolCapacity.styled"
import { usePoolCapacity } from "sections/pools/pool/capacity/PoolCapacity.utils"
import { useMeasure } from "react-use"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

type Props = { id: string; className?: string }

export const PoolCapacity = ({ id, className }: Props) => {
  const capacity = usePoolCapacity(id)
  const [ref, { width }] = useMeasure<HTMLDivElement>()

  if (capacity.isLoading || !capacity.data) return null

  const isError = capacity.data.capacity.isNaN()
  const filled = isError ? "0" : capacity.data.filledPercent.toFixed(2)
  const isFull = capacity.data.filledPercent.eq(100)

  return (
    <SContainer ref={ref} className={className}>
      <div sx={{ flex: ["column-reverse", "column"] }}>
        {!isError && (
          <div>
            <Trans
              i18nKey={
                isFull
                  ? "liquidity.asset.capacity.full"
                  : "liquidity.asset.capacity"
              }
              tOptions={{
                symbol: capacity.data.symbol,
                filled: capacity.data.filled,
                capacity: capacity.data.capacity,
              }}
            >
              <Text
                fs={11}
                fw={500}
                color={isFull ? "pink600" : "basic400"}
                as="span"
              />
              <Text fs={11} fw={500} color="brightBlue100" as="span" />
            </Trans>
          </div>
        )}
        <SBarContainer>
          <SBar filled={filled} width={width} isFull={isFull} />
        </SBarContainer>
      </div>
    </SContainer>
  )
}
