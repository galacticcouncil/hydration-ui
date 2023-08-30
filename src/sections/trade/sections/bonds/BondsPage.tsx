import { Heading } from "components/Typography/Heading/Heading"
import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useBonds } from "api/bonds"
import { format } from "date-fns"
import { useAssetMetaList } from "api/assetMeta"
import { WhyBonds } from "./components/WhyBonds"
import { useTranslation } from "react-i18next"
import { MyActiveBonds } from "./MyActiveBonds"

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
      <div sx={{ flex: "column", gap: 12 }}>
        {bonds.data
          ? bonds.data.map((bond) => {
              const meta = metas.data?.find((meta) => meta.id === bond.assetId)
              const date = new Date(bond.maturity)

              return (
                <Bond
                  key={`${bond.assetId}_${bond.maturity}`}
                  icon={<AssetLogo id={bond.assetId} />}
                  title={`${meta?.symbol.toLocaleUpperCase()}b${format(
                    date,
                    "yyyyMMdd",
                  )}`}
                  maturity={format(date, "dd/MM/yyyy")}
                  endingIn="23H 22m"
                  discount="5"
                  onDetailClick={console.log}
                />
              )
            })
          : null}
      </div>
      <div sx={{ mt: 40 }}>
        <MyActiveBonds isLoading={bonds.isLoading} bonds={bonds.data ?? []} />
      </div>
    </>
  )
}
