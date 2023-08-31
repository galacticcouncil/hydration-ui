import { Heading } from "components/Typography/Heading/Heading"
import { Bond } from "components/Bond/Bond"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { useBonds, useLbpPool } from "api/bonds"
import { format } from "date-fns"
import { useAssetMetaList } from "api/assetMeta"
import { WhyBonds } from "./components/WhyBonds"
import { useTranslation } from "react-i18next"
import { MyActiveBonds } from "./MyActiveBonds"
import { useNavigate } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

export const BondsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const bonds = useBonds()
  const lbpPool = useLbpPool()
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
              const pool = lbpPool?.data?.find((pool) =>
                pool.assets.some((assetId) => assetId === bond.id),
              )

              return (
                <Bond
                  key={`${bond.assetId}_${bond.maturity}`}
                  icon={<AssetLogo id={bond.assetId} />}
                  title={`${meta?.symbol.toLocaleUpperCase()}b${format(
                    date,
                    "yyyyMMdd",
                  )}`}
                  maturity={format(date, "dd/MM/yyyy")}
                  end={pool?.end}
                  discount="5"
                  onDetailClick={() =>
                    navigate({
                      to: LINKS.bond,
                      search: { id: bond.id },
                    })
                  }
                />
              )
            })
          : null}
      </div>
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
