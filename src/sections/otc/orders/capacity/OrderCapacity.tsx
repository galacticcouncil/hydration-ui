import { SBar, SBarContainer, SContainer } from "./OrderCapacity.styled"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { OfferingPair } from "../OtcOrdersData.utils"

export const OrderCapacity = (props: { offering: OfferingPair }) => {
  const { t } = useTranslation()

  //console.log(props.offering)

  if (!props.offering?.initial) return null

  const filled = props.offering.initial.minus(props.offering.amount)
  const filledPct = filled.div(props.offering.initial).multipliedBy(100)

  return (
    <SContainer padding={false}>
      <div sx={{ flex: "row-reverse", align: "center" }}>
        <Text fs={11} fw={500} sx={{ ml: 5, width: 25 }} color="brightBlue100" as="span">
          {t("otc.order.capacity", { filled: filledPct })}
        </Text>
        <SBarContainer>
          <SBar filled={filledPct.toFixed()} width={170} />
        </SBarContainer>
      </div>
      <div>
        <Text fs={12} fw={500} color="basic400" as="span">
          {t("otc.order.remaining", {
            filled: props.offering.initial.minus(props.offering.amount),
            initial: props.offering.initial,
            symbol: props.offering.symbol,
          })}
        </Text>
      </div>
    </SContainer>
  )
}
