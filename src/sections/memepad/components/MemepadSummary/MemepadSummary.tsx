import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { MemepadSummaryValues } from "sections/memepad/form/MemepadForm.utils"
import { SContainer, SHeading, SRowItem } from "./MemepadSummary.styled"
import { Text } from "components/Typography/Text/Text"
import DecorativeStarIcon from "assets/icons/DecorativeStarIcon.svg?react"
import { useTranslation } from "react-i18next"
import { shortenAccountAddress } from "utils/formatting"

type MemepadSummaryProps = {
  values: MemepadSummaryValues | null
  onReset: () => void
}

export const MemepadSummary: React.FC<MemepadSummaryProps> = ({
  values,
  onReset,
}) => {
  const { t } = useTranslation()
  return (
    <SContainer>
      <div>
        <SHeading>
          <DecorativeStarIcon />
          <Text
            fs={[12, 22]}
            lh={[20, 26]}
            tTransform="uppercase"
            tAlign="center"
            font="GeistMedium"
          >
            Congrats!
          </Text>
          <GradientText
            fs={[22, 34]}
            tTransform="uppercase"
            tAlign="center"
            sx={{ display: "block" }}
          >
            You've succesfully
            <br />
            created new asset!
          </GradientText>
          <DecorativeStarIcon />
        </SHeading>
        {values && (
          <div sx={{ mb: 20 }}>
            <Text sx={{ mb: 12 }} color="brightBlue300">
              Here is your summary:
            </Text>
            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.name")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {values.name}
              </Text>
            </SRowItem>
            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.symbol")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {values.symbol}
              </Text>
            </SRowItem>
            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.decimals")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {values.decimals}
              </Text>
            </SRowItem>
            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.deposit")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {t("value.token", {
                  value: values.deposit,
                })}
              </Text>
            </SRowItem>
            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.supply")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {t("value.token", {
                  value: values.supply,
                })}
              </Text>
            </SRowItem>

            <SRowItem>
              <Text fs={14} color="basic400">
                {t("wallet.addToken.form.account")}
              </Text>
              <Text fs={14} color="brightBlue300">
                {values.account ? shortenAccountAddress(values.account) : ""}
              </Text>
            </SRowItem>
            {/* {Object.entries(values).map(([key, value]) => (
              <SRowItem>
                <Text fs={14} color="basic400">
                  {t(`wallet.addToken.form.${key}` as any)}
                </Text>
                <Text fs={14} color="brightBlue300">
                  {typeof value === "string" && value.length > 10
                    ? value.slice(0, 10)
                    : value}
                </Text>
              </SRowItem>
            ))} */}
          </div>
        )}
        <div
          sx={{ flex: ["column", "row"], gap: 12, justify: "space-between" }}
        >
          <Button size="small" onClick={onReset}>
            Create another asset
          </Button>
          <Button size="small" onClick={onReset}>
            Add logo through GitHub
          </Button>
        </div>
      </div>
    </SContainer>
  )
}
