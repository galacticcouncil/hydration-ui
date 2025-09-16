import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ModalContent,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool"

export const MyLiquidityActions: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <ModalRoot>
      <Button size="medium" asChild>
        <ModalTrigger>
          <Plus />
          {t("myLiquidity.header.cta")}
        </ModalTrigger>
      </Button>
      <ModalContent>
        <CreateIsolatedPool />
      </ModalContent>
    </ModalRoot>
  )
}
