import { Heading } from "components/Typography/Heading/Heading"
import { useTranslation } from "react-i18next"
import { WhyBonds } from "./components/WhyBonds"
import { Skeleton as BondTableSkeleton } from "./table/skeleton/Skeleton"
import { Spacer } from "components/Spacer/Spacer"

export const BondsPageSkeleton = () => {
  const { t } = useTranslation()

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds")}
      </Heading>
      <Spacer size={40} />
      <WhyBonds />
      <div sx={{ mt: 40 }}>
        <BondTableSkeleton title={t("bonds.table.title")} />
      </div>
    </>
  )
}
