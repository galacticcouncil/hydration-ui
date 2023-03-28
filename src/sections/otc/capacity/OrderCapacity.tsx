import { SBar, SBarContainer, SContainer } from "./OrderCapacity.styled"
import { useMeasure } from "react-use"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"

export const OrderCapacity = (props: {
  total: BigNumber
  free: BigNumber
  symbol?: string
  modal?: boolean
}) => {
  const { t } = useTranslation()
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const { modal = false } = props

  const filled = props.total.minus(props.free)
  const filledPct = filled.div(props.total).multipliedBy(100)

  return (
    <SContainer ref={ref} modal={modal}>
      <div sx={{ flex: "row-reverse", align: "center" }}>
        <Text
          fs={modal ? 13 : 11}
          fw={500}
          sx={{ ml: 5, width: 25 }}
          color="brightBlue100"
          as="span"
        >
          {t("otc.order.capacity", { filled: filledPct })}
        </Text>
        <SBarContainer modal={modal}>
          <SBar filled={filledPct.toFixed()} width={modal ? width : 170} />
        </SBarContainer>
      </div>
      {!modal && (
        <div>
          <Text fs={12} fw={500} color="basic400" as="span">
            {t("otc.order.remaining", {
              filled: props.total.minus(props.free),
              initial: props.total,
              symbol: props.symbol,
            })}
          </Text>
        </div>
      )}
    </SContainer>
  )
}
