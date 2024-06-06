import { BondSkeleton } from "components/Bond/BondSkeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const BondListSkeleton = () => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <Text color="brightBlue300" fs={15} font="GeistMono">
        {t("bonds.section.activeBonds")}
      </Text>
      <BondSkeleton />
    </div>
  )
}
