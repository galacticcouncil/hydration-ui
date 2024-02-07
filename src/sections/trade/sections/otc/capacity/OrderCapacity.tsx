import { SBar, SBarContainer, SContainer } from "./OrderCapacity.styled"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import { motion } from "framer-motion"
import { useState } from "react"

export const OrderCapacity = (props: {
  total: BigNumber
  free: BigNumber
  symbol?: string
  modal?: boolean
  roundingMode?: BigNumber.RoundingMode
}) => {
  const { t } = useTranslation()
  const { modal = false, roundingMode = 1 } = props
  const [orderHovered, setOrderHovered] = useState(false)

  const filled = props.total.minus(props.free)
  const filledPct = filled
    .div(props.total)
    .multipliedBy(100)
    .decimalPlaces(0, roundingMode)

  return (
    <SContainer
      modal={modal}
      onMouseEnter={() => setOrderHovered(true)}
      onMouseLeave={() => setOrderHovered(false)}
    >
      <div sx={{ flex: "row", align: "center" }}>
        <SBarContainer modal={modal}>
          <SBar filled={filledPct.toFixed()} />
        </SBarContainer>

        {modal && (
          <Text
            fs={modal ? 13 : 11}
            fw={500}
            color="brightBlue100"
            as="span"
            sx={{ ml: 10 }}
          >
            {filledPct.toFixed(0)}%
          </Text>
        )}
      </div>
      {!modal && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          transition={{ delay: 0.4, duration: 0.2 }}
          animate={orderHovered ? { opacity: 1, y: 6 } : { opacity: 0, y: 0 }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <Text
              fs={12}
              fw={500}
              color="basic400"
              as="span"
              sx={{ textAlign: "center" }}
            >
              {t("otc.order.remaining", {
                filled: props.total.minus(props.free),
                initial: props.total,
                symbol: props.symbol,
              })}
              &nbsp;
              <Text fs={12} fw={500} color="brightBlue100" as="span">
                {t("otc.order.capacity", { filled: filledPct })}
              </Text>
            </Text>
          </div>
        </motion.div>
      )}
    </SContainer>
  )
}
