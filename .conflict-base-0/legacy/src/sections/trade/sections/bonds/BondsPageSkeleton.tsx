import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { Skeleton as BondTableSkeleton } from "./table/skeleton/Skeleton"

export const BondsPageSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds")}
      </Heading>
      <div sx={{ mt: 40 }}>
        <BondTableSkeleton title={t("bonds.table.title")} />
      </div>
    </>
  )
}
