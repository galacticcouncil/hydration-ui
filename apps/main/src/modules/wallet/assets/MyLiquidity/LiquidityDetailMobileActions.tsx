import { Button, Grid, Modal } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"

type Props = {
  readonly assetId: string
}

export const LiquidityDetailMobileActions: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <Grid columnGap={8} sx={{ gridTemplateColumns: "1fr 1fr" }}>
        <Button size="large" asChild>
          <Link to={"/liquidity/$id"} params={{ id: assetId }}>
            {t("myLiquidity.actions.poolDetails")}
          </Link>
        </Button>
        <Button
          variant="tertiary"
          size="large"
          onClick={() => setIsAddOpen(true)}
        >
          {t("myLiquidity.actions.addLiquidity")}
        </Button>
      </Grid>
      <Modal open={isAddOpen} onOpenChange={setIsAddOpen}>
        <AddLiquidityModalContent
          id={assetId}
          closable
          onSubmitted={() => setIsAddOpen(false)}
        />
      </Modal>
    </>
  )
}
