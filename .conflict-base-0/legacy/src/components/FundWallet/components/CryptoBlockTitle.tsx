import { Heading } from "components/Typography/Heading/Heading"
import FundCryptoIcon from "assets/icons/FundCryptoIcon.svg?react"
import { useTranslation } from "react-i18next"

export const CryptoBlockTitle = () => {
  const { t } = useTranslation()

  return (
    <div sx={{ display: "flex", align: "center", gap: 9, width: "100%" }}>
      <FundCryptoIcon />
      <Heading as="h2" fw={600} fs={20}>
        {t("fund.modal.crypto.title")}
      </Heading>
    </div>
  )
}
