import { Icon } from "components/Icon/Icon"
import { Button } from "components/Button/Button"
import { ComponentProps, useState } from "react"
import { LiquidityPositionModal } from "./LiquidityPositionModal"
import { ReactComponent as DetailsIcon } from "assets/icons/DetailsIcon.svg"
import { useAccountStore } from "state/store"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useTranslation } from "react-i18next"

type Props = Omit<
  ComponentProps<typeof LiquidityPositionModal>,
  "isOpen" | "onClose"
>

export const LiquidityPositionButton = (props: Props) => {
  const [openLiquidityPositions, setOpenLiquidityPositions] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { t } = useTranslation()

  return (
    <>
      <Button
        fullWidth
        size="small"
        disabled={!account}
        onClick={() => {
          setOpenLiquidityPositions(true)
        }}
      >
        <div sx={{ flex: "row", align: "center", justify: "center" }}>
          <Icon icon={<DetailsIcon />} sx={{ mr: 8, height: 16 }} />
          {t("liquidity.asset.actions.myPositions")}
        </div>
      </Button>
      {openLiquidityPositions && !isDesktop && (
        <LiquidityPositionModal
          isOpen={openLiquidityPositions}
          onClose={() => setOpenLiquidityPositions(false)}
          {...props}
        />
      )}
    </>
  )
}
