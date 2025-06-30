import { useTranslation } from "react-i18next"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { RejoinFarm, useRedepositOmnipoolFarms } from "utils/farms/deposit"
import { BN_0 } from "utils/constants"

type RejoinAllFarmsProps = {
  rejoinFarms: RejoinFarm[]
  symbol: string
  onClose: () => void
}

export const RejoinAllFarms = ({
  rejoinFarms,
  symbol,
  onClose,
}: RejoinAllFarmsProps) => {
  const { t } = useTranslation()

  const totalCurrentValue = rejoinFarms
    .reduce((acc, rejoinFarm) => acc.plus(rejoinFarm.currentValue ?? 0), BN_0)
    .toString()

  const { mutate } = useRedepositOmnipoolFarms({
    farms: rejoinFarms,
    total: totalCurrentValue,
    symbol,
    onSubmit: onClose,
  })

  return (
    <SJoinFarmContainer>
      <div
        sx={{
          flex: ["column", "row"],
          justify: "space-between",
          p: 30,
          gap: [4, 120],
        }}
      >
        <Text>{t("farms.modal.footer.title")}</Text>

        <Text color="pink600" fs={20} css={{ whiteSpace: "nowrap" }}>
          {t("value.tokenWithSymbol", {
            value: totalCurrentValue,
            symbol,
          })}
        </Text>
      </div>

      <Button fullWidth variant="primary" onClick={() => mutate()}>
        {t("farms.modal.join.all")}
      </Button>
    </SJoinFarmContainer>
  )
}
