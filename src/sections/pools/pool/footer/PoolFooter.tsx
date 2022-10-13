import { Text } from "components/Typography/Text/Text"
import { SContainer } from "sections/pools/pool/footer/PoolFooter.styled"
import { useTranslation } from "react-i18next"
import { usePoolFooterValues } from "sections/pools/pool/footer/PoolFooter.utils"
import { PoolBase } from "@galacticcouncil/sdk"

type Props = { pool: PoolBase }

export const PoolFooter = ({ pool }: Props) => {
  const { t } = useTranslation()

  const { locked } = usePoolFooterValues(pool)

  if (!locked || locked.isZero()) return null

  return (
    <SContainer>
      <div>
        <Text color="primary100" fs={16} fw={600} lh={22}>
          {t("pools.pool.claim.total", { locked })}
        </Text>
      </div>
      {/*<div sx={{ flex: "row", justify: "center" }}>*/}
      {/*  <Text color="primary300" fs={16} fw={600} lh={22} tAlign="center">*/}
      {/*    {t("pools.pool.claim.claimable", { claimable })}*/}
      {/*  </Text>*/}
      {/*</div>*/}
      {/*<div sx={{ flex: "row", justify: "end" }}>*/}
      {/*  <Button variant="gradient" size="small" sx={{ p: "12px 21px" }}>*/}
      {/*    <FlagIcon />*/}
      {/*    {t("pools.pool.claim.button")}*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </SContainer>
  )
}
