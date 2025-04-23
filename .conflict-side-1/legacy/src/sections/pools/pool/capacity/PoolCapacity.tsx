import { SContainer } from "./PoolCapacity.styled"
import { usePoolCapacity } from "sections/pools/pool/capacity/PoolCapacity.utils"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { LinearProgress } from "components/Progress"
import { theme } from "theme"

type Props = { id: string; className?: string }

export const PoolCapacity = ({ id, className }: Props) => {
  const capacity = usePoolCapacity(id)

  if (capacity.isLoading || !capacity.data) return null

  const isError = capacity.data.capacity.isNaN()
  const filled = isError ? "0" : capacity.data.filledPercent.toFixed(2)
  const isFull = capacity.data.filledPercent.eq(100)

  return (
    <SContainer className={className}>
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

        <LinearProgress
          size="small"
          percent={Number(filled)}
          withoutLabel
          colorCustom={isFull ? theme.gradients.pinkDarkPink : undefined}
          color="pink600"
          colorEnd="brightBlue600"
        />
      </div>
    </SContainer>
  )
}
