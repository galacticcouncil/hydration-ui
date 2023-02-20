import {
  SContainer,
  SSeparator,
  SValueContainer,
} from "./FarmingPosition.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import { theme } from "theme"
import { RedepositFarms } from "./redeposit/RedepositFarms"
import { JoinedFarms } from "./joined/JoinedFarms"

export const FarmingPosition = ({ index }: { index: number }) => {
  const { t } = useTranslation()

  return (
    <SContainer>
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", py: 10 }}
      >
        <Text fw={[500, 400]}>
          {t("farms.positions.position.title", { index })}
        </Text>
        <Button size="small" sx={{ ml: 14 }}>
          {t("farms.positions.joinedFarms.button.label")}
        </Button>
      </div>
      <SSeparator />
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          gap: 40,
          py: 10,
        }}
      >
        <div sx={{ flex: "row", justify: "space-between", flexGrow: 1 }}>
          <SValueContainer>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.enterDate")}
            </Text>
            <Text>2.02.2022</Text>
          </SValueContainer>
          <SSeparator orientation="vertical" />
          <SValueContainer>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.lockedShares")}
            </Text>
            <Text>2 855.222</Text>
          </SValueContainer>
          <SSeparator orientation="vertical" />
          <SValueContainer sx={{ width: 150 }}>
            <Text color="basic500" fs={14} lh={16} fw={400}>
              {t("farms.positions.labels.currentValue")}
            </Text>
            <div>
              <Text>0.333 BTC</Text>
              <Text
                fs={11}
                lh={15}
                css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
              >
                2 3334$
              </Text>
            </div>
          </SValueContainer>
        </div>
      </div>
      <SSeparator />
      <div sx={{ flex: "row", justify: "space-between", pt: 10 }}>
        <JoinedFarms />
        <RedepositFarms />
      </div>
    </SContainer>
  )
}
