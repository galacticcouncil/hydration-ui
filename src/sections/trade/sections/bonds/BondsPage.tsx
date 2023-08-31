import { Heading } from "components/Typography/Heading/Heading"
import { useBonds } from "api/bonds"
import { useAssetMetaList } from "api/assetMeta"
import { WhyBonds } from "./components/WhyBonds"
import { useTranslation } from "react-i18next"
import { MyActiveBonds } from "./MyActiveBonds"
import { BondList } from "./list/BondList"

export const BondsPage = () => {
  const { t } = useTranslation()
  const bonds = useBonds()
  const metas = useAssetMetaList(bonds.data?.map((bond) => bond.assetId) ?? [])

  return (
    <>
      <Heading fs={19} sx={{ mb: 33 }}>
        {t("bonds.title")}
      </Heading>
      <WhyBonds />
      <BondList
        isLoading={bonds.isLoading}
        bonds={bonds.data ?? []}
        metas={metas.data ?? []}
      />
      <div sx={{ mt: 40 }}>
        <MyActiveBonds
          isLoading={bonds.isLoading}
          bonds={bonds.data ?? []}
          metas={metas.data ?? []}
        />
      </div>
    </>
  )
}
