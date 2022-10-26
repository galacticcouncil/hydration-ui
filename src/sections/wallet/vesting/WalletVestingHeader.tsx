import { Text } from "../../../components/Typography/Text/Text"
import { Heading } from "../../../components/Typography/Heading/Heading"
import { Separator } from "../../../components/Separator/Separator"
import { useTranslation } from "react-i18next"

export const WalletVestingHeader = () => {
  const { t } = useTranslation()

  return (
    <div
      sx={{ flex: ["column", "row"], mb: 40 }}
      css={{ "> *:not([role='separator'])": { flex: 1 } }}
    >
      <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
        <Text color="neutralGray300" sx={{ mb: 14 }}>
          {t("wallet.vesting.claimable")}
        </Text>
        <div sx={{ flex: "row", align: "baseline" }}>
          <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 900 }}>
            {t("value.usd", { amount: "1" })}
          </Heading>
        </div>
      </div>
      <Separator sx={{ mb: 12, display: ["inherit", "none"] }} />
      <div sx={{ flex: ["row", "column"], justify: "space-between" }}>
        <Text color="neutralGray300" sx={{ mb: 14 }}>
          {t("wallet.vesting.total_vested")}
        </Text>
        <div sx={{ flex: "row", align: "baseline" }}>
          <Heading as="h3" sx={{ fontSize: [16, 42], fontWeight: 900 }}>
            {t("value.usd", { amount: "2" })}
          </Heading>
        </div>
      </div>
    </div>
  )
}
