import { Text } from "components/Typography/Text/Text"

type Props = {
  state: "BURNING" | "BIDDING"
}
export const PieChartLabel = ({ state }: Props) => {
  // const { t } = useTranslation()

  return (
    <>
      <Text fs={12}>status:</Text>
      <Text fs={20} font="FontOver">
        {state}
      </Text>
    </>
  )
}
