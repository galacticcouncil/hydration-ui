import { Icon } from "components/Icon/Icon"
import { Button } from "components/Button/Button"
import { ComponentProps, useState } from "react"
import { LiquidityPositionModal } from "./LiquidityPositionModal"
import DetailsIcon from "assets/icons/DetailsIcon.svg?react"
import { useAccountStore } from "state/store"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { BN_0 } from "utils/constants"
import { usePoolPositions } from "sections/pools/pool/Pool.utils"

type Props = Omit<
  ComponentProps<typeof LiquidityPositionModal>,
  "isOpen" | "onClose" | "positions"
>

export const LiquidityPositionButton = (props: Props) => {
  const [openLiquidityPositions, setOpenLiquidityPositions] = useState(false)
  const { account } = useAccountStore()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { t } = useTranslation()
  const positions = usePoolPositions(props.pool.id)

  const hasPosition =
    props.amount.isGreaterThan(BN_0) || !!positions.data?.length

  return (
    <>
      <Button
        fullWidth
        size="small"
        disabled={!account || !hasPosition}
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
          positions={positions}
          isOpen={openLiquidityPositions}
          onClose={() => setOpenLiquidityPositions(false)}
          {...props}
        />
      )}
    </>
  )
}
