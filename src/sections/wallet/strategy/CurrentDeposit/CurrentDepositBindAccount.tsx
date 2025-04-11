import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import InfoIcon from "assets/icons/LPInfoIcon.svg?react"
import { useEvmAccountBind } from "api/evm"
import { useTranslation } from "react-i18next"

export const CurrentDepositBindAccount = () => {
  const { t } = useTranslation()
  const { mutate: bindEvmAccount, isLoading } = useEvmAccountBind()
  return (
    <div sx={{ flex: "column", align: "center", gap: 4 }}>
      <Button
        isLoading={isLoading}
        variant="primary"
        size="small"
        onClick={() => bindEvmAccount()}
      >
        {t("lending.bind.banner.button")}
      </Button>
      <div sx={{ flex: "row", align: "center", gap: 4 }}>
        <InfoIcon width={16} height={16} />
        <Text fs={12}>{t("wallet.strategy.claim.enable")}</Text>
      </div>
    </div>
  )
}
